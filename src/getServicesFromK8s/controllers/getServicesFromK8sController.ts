import { Logger } from '@map-colonies/js-logger';
import { IConfig } from 'config';
import { RequestHandler } from 'express';
import { injectable, inject } from 'tsyringe';
import { SERVICES } from '../../common/constants';
import K8sOperations from '../../common/utils/k8sOperations';

type GetServicesFromCluster = RequestHandler<undefined>;

@injectable()
export default class GetServicesFromK8sController {
  private readonly namespace: string;

  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(SERVICES.K8S_OPERATIONS) private readonly k8s: K8sOperations,
    @inject(SERVICES.CONFIG) private readonly config: IConfig
  ) {
    this.namespace = this.config.get<string>('kubernetes.namespace');
  }

  public getDeploymentsAndServicesFromCluster: GetServicesFromCluster = async (req, res, next) => {
    try {
      const depsAndSvcs = await this.k8s.getDeploymentsAndServices(this.namespace);

      res.send(depsAndSvcs);
    } catch (e) {
      next(e);
    }
  };
}
