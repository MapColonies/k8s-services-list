import { Logger } from '@map-colonies/js-logger';
import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { SERVICES } from '../../common/constants';
import K8sOperations from '../../common/utils/k8sOperations';

type GetServicesFromCluster = RequestHandler<undefined>;

@injectable()
export default class GetServicesFromK8sController {
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(SERVICES.K8S_OPERATIONS) private readonly k8s: K8sOperations
  ) {}

  public getDeploymentsAndServicesFromCluster: GetServicesFromCluster = async (req, res, next) => {
    try {
        const deploymentsAndServices = await this.k8s.getDeploymentsAndServices();
        
        res.send(deploymentsAndServices);
    } catch (e) {
      next(e);
    }
  };
}
