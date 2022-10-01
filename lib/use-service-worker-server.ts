import { type ServiceWorkerState } from "./use-service-worker-browser";

export {
  SERVICE_WORKER_CACHED,
  SERVICE_WORKER_ERROR,
  SERVICE_WORKER_OFFLINE,
  SERVICE_WORKER_READY,
  SERVICE_WORKER_REGISTERED,
  SERVICE_WORKER_UPDATE_FOUND,
  SERVICE_WORKER_UPDATE_READY,
} from "./use-service-worker-browser";

let serviceWorkerState: ServiceWorkerState = {
  registration: null,
  serviceWorkerStatus: "register",
};

export function useServiceWorker() {
  return serviceWorkerState;
}
