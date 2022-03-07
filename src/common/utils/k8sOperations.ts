import { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import * as K8S from '@kubernetes/client-node';
import { V1ServiceList } from '@kubernetes/client-node';
import { SERVICES } from '../constants';
import { IConfig } from '../interfaces';

@injectable()
class K8sOperations {
  private readonly k8sApi: K8S.CoreV1Api;

  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(SERVICES.CONFIG) private readonly config: IConfig
  ) {
    
    const kc = new K8S.KubeConfig();
    if(this.config.get<boolean>('kubernetes.loadConfigFromCluster')){
      kc.loadFromCluster();
    } else {
      kc.loadFromDefault();
    }

    this.k8sApi = kc.makeApiClient(K8S.CoreV1Api);
  }

  public getServicesFromCluster = async (): Promise<V1ServiceList> => {
    const svcs = await this.k8sApi.listServiceForAllNamespaces();
    return svcs.body;
  };
}

export default K8sOperations;
