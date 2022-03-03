import { Logger } from "@map-colonies/js-logger";
import { inject, injectable } from "tsyringe";
import K8S from '@kubernetes/client-node';
import { SERVICES } from "../constants";

@injectable()
class K8sOperations {
  public constructor( @inject(SERVICES.LOGGER) private readonly logger: Logger) {}

  public getServicesFromCluster = async (): Promise<string> => {
    const kc = new K8S.KubeConfig();
    kc.loadFromDefault();
    
    const k8sApi = kc.makeApiClient(K8S.CoreV1Api);

   const pods =  await k8sApi.listNamespacedPod('default').then((res)=>{
        return res.body.items
    })
    return pods.join();
  }
}

export default K8sOperations;