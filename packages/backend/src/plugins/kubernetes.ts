import { loggerToWinstonLogger } from '@backstage/backend-common';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node/alpha';
import { KubernetesBuilder } from '@backstage/plugin-kubernetes-backend';

export const kubernetesPlugin = createBackendPlugin({
  pluginId: 'kubernetes',
  register(env) {
    env.registerInit({
      deps: {
        http: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,
        catalogApi: catalogServiceRef,
        permissions: coreServices.permissions,
        auth: coreServices.auth,
        httpAuth: coreServices.httpAuth,
      },
      async init({
        http,
        logger,
        config,
        discovery,
        catalogApi,
        permissions,
        auth,
        httpAuth,
      }) {
        const winstonLogger = loggerToWinstonLogger(logger);

        const { router } = await KubernetesBuilder.createBuilder({
          logger: winstonLogger,
          config,
          catalogApi,
          permissions,
          discovery,
          auth,
          httpAuth,
        }).build();

        // We register the router with the http service.
        http.use(router);
      },
    });
  },
});

export { kubernetesPlugin as default };
