import { Logger } from '@map-colonies/js-logger';
import { IConfig } from 'config';
import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { SERVICES } from '../../common/constants';
import { DepsAndServices } from '../../common/interfaces';
import K8sOperations from '../../common/utils/k8sOperations';

type GetServicesFromCluster = RequestHandler<undefined>;

@injectable()
export default class GetServicesFromK8sController {
<<<<<<< HEAD
  private readonly namespace: string;
=======
  private readonly namespaces: string[] = [];
>>>>>>> cdf126ca071629292c2ded7f85624959d5eba732

  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(SERVICES.K8S_OPERATIONS) private readonly k8s: K8sOperations,
    @inject(SERVICES.CONFIG) private readonly config: IConfig
  ) {
<<<<<<< HEAD
    this.namespace = this.config.get<string>('kubernetes.namespace');
=======
    this.namespaces = this.config.get<string[]>('kubernetes.namespaces');
>>>>>>> cdf126ca071629292c2ded7f85624959d5eba732
  }

  public getDeploymentsAndServicesFromCluster: GetServicesFromCluster = async (req, res, next) => {
    try {
<<<<<<< HEAD
      const depsAndSvcs = await this.k8s.getDeploymentsAndServices(this.namespace);    

      res.send(depsAndSvcs);
=======
      const namespacedDepsAndSvcs = this.namespaces.reduce((acc: Record<string, DepsAndServices[]>, ns) => {
        acc[ns] = [];
        return acc;
      }, {});

      for(const ns of Object.keys(namespacedDepsAndSvcs)){
        const depsAndSvcs = await this.k8s.getDeploymentsAndServices(ns);
        namespacedDepsAndSvcs[ns] = depsAndSvcs;
      }

      res.send(namespacedDepsAndSvcs);
>>>>>>> cdf126ca071629292c2ded7f85624959d5eba732
    } catch (e) {
      next(e);
    }
  };
}
