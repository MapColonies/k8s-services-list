import { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import * as K8S from '@kubernetes/client-node';
import { V1Deployment, V1ServiceList, V1ServicePort } from '@kubernetes/client-node';
import { SERVICES } from '../constants';
import { IConfig } from '../interfaces';

@injectable()
class K8sOperations {
  private readonly corek8sApi: K8S.CoreV1Api;
  private readonly appsK8s: K8S.AppsV1Api;

  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger, @inject(SERVICES.CONFIG) private readonly config: IConfig) {
    const kc = new K8S.KubeConfig();
    if (this.config.get<boolean>('kubernetes.loadConfigFromCluster')) {
      kc.loadFromCluster();
    } else {
      kc.loadFromDefault();
    }

    this.corek8sApi = kc.makeApiClient(K8S.CoreV1Api);
    this.appsK8s = kc.makeApiClient(K8S.AppsV1Api);
  }

  public getServicesFromCluster = async (): Promise<V1ServiceList> => {
    const svcs = await this.corek8sApi.listNamespacedService('client');
    return svcs.body;
  };

  public getDeployments = async (): Promise<
  K8S.V1Deployment[] | {
    name: string | undefined;
    status: string | undefined;
    image: string | undefined;
    services: {
        name: string;
        uid: string;
        ports: V1ServicePort[];
    }[];
}[]> => {
    const services = await this.getServicesFromCluster();
    
    const deployment = await this.appsK8s.listNamespacedDeployment('client')
    .then((deploymentsRes) => {
      const deployItems = deploymentsRes.body.items;
      if (deployItems.length === 0) {
        return [];
      }

      const deployments = [];
      
      for (const deployment of deployItems) {
        const depServices = services.items
          .filter((svc) => svc.metadata?.name === deployment.metadata?.name)
          .reduce((acc: { name: string; uid: string; ports: V1ServicePort[]}[], svc) => {
              return [...acc, {
                name: svc.metadata?.name as string,
                uid: svc.metadata?.uid as string,
                ports: svc.spec?.ports as K8S.V1ServicePort[],
              }];
            },
            []
          );

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
}

export default K8sOperations;
