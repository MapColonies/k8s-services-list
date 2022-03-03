import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import K8sOperations from '../../common/utils/k8sOperations';

const getServicesFromK8sRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
//   const controller = dependencyContainer.resolve(AnotherResourceController);
    const k8s = dependencyContainer.resolve(K8sOperations)

  router.get('/getServices', (req, res, next) => {
    res.send('HELLO FROM GET SERVICES!')
  });

  return router;
};

export const GET_SERVICES_FROM_K8S_ROUTER_SYMBOL = Symbol('getServicesFromK8sRouterFactory');

export { getServicesFromK8sRouterFactory };
