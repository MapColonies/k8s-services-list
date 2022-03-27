import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import GetServicesFromK8sController from '../controllers/getServicesFromK8sController';

const getServicesFromK8sRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const controller = dependencyContainer.resolve(GetServicesFromK8sController);

  router.get('/getDeploymentsAndServices', controller.getDeploymentsAndServicesFromCluster);

  return router;
};

export const GET_SERVICES_FROM_K8S_ROUTER_SYMBOL = Symbol('getServicesFromK8sRouterFactory');

export { getServicesFromK8sRouterFactory };
