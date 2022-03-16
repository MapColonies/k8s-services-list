import { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import * as K8S from '@kubernetes/client-node';
import { V1Deployment, V1EndpointsList, V1ServiceList } from '@kubernetes/client-node';
import { SERVICES } from '../constants';
import { DepsAndServices, IConfig, K8sService } from '../interfaces';

@injectable()
class K8sOperations {
  private readonly corek8sApi: K8S.CoreV1Api;
  private readonly appsK8s: K8S.AppsV1Api;

  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger, @inject(SERVICES.CONFIG) private readonly config: IConfig) {
    const kc = new K8S.KubeConfig();
    const SHOULD_LOAD_FROM_CLUSTER = this.config.get<boolean>('kubernetes.loadConfigFromCluster');
    if (SHOULD_LOAD_FROM_CLUSTER) {
      kc.loadFromCluster();
    } else {
      kc.loadFromDefault();
    }

    this.corek8sApi = kc.makeApiClient(K8S.CoreV1Api);
    this.appsK8s = kc.makeApiClient(K8S.AppsV1Api);
  }

  public getDeploymentsAndServices = async (namespace: string): Promise<DepsAndServices[]> => {
    const services = await this.getServicesFromCluster(namespace);

    const deployment = await this.appsK8s.listNamespacedDeployment(namespace).then(async (deploymentsRes) => {
      const deployItems = deploymentsRes.body.items;
      if (deployItems.length === 0) {
        return [];
      }

      const deployments = [];

      for (const deployment of deployItems) {
        const addressList = await this.getAddressListForService(namespace, deployment.metadata?.name as string);

        const depServices = services.items
          .filter((svc) => svc.metadata?.name === deployment.metadata?.name)
          .reduce((acc: K8sService[], svc) => {
            return [
              ...acc,
              {
                name: svc.metadata?.name as string,
                uid: svc.metadata?.uid as string,
                addresses: addressList,
              },
            ];
          }, []);

        deployments.push({
          name: deployment.metadata?.name,
          status: deployment.status?.conditions?.[0].status,
          image: deployment.spec?.template.spec?.containers[0].image,
          services: [...depServices],
        });
      }
      return deployments;
    });

    return deployment;
  };

  private readonly getAddressListForService = async (namespace: string, serviceName: string): Promise<string[]> => {
    const endpoints = await this.getEndpoints(namespace);

    const serviceEndpoint = endpoints.items.find((endpoint) => endpoint.metadata?.name === serviceName);

    if (!serviceEndpoint) {
      return [];
    }

    const addresses: string[] = [];

    if (typeof serviceEndpoint.subsets !== 'undefined') {
      for (const subset of serviceEndpoint.subsets) {
        subset.addresses?.forEach((address) => {
          const addressIp = address.ip;
          subset.ports?.forEach((portObj) => {
            addresses.push(`${addressIp}:${portObj.port}`);
          });
        });
      }
    }

    return addresses;
  };

  private readonly getEndpoints = async (namespace: string): Promise<V1EndpointsList> => {
    const ep = await this.corek8sApi.listNamespacedEndpoints(namespace);
    return ep.body;
  };
  private readonly getServicesFromCluster = async (namespace: string): Promise<V1ServiceList> => {
    const svcs = await this.corek8sApi.listNamespacedService(namespace);
    return svcs.body;
  };
}

export default K8sOperations;
