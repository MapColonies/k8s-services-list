export interface IConfig {
  get: <T>(setting: string) => T;
  has: (setting: string) => boolean;
}

export interface OpenApiConfig {
  filePath: string;
  basePath: string;
  jsonPath: string;
  uiPath: string;
}

export interface K8sService {
  name: string;
  uid: string;
  addresses: string[];
}

export interface DepsAndServices {
  name: string | undefined;
  status: string | undefined;
  image: string | undefined;
  services: K8sService[];
}