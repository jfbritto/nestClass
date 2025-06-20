import { SetMetadata } from '@nestjs/common/decorators/core/set-metadata.decorator';
import { ROUTE_POLICY_KEY } from '../auth.constants';
import { RoutePolicies } from '../enum/route-policies.enum';

export const SetRoutePolicy = (policy: RoutePolicies) => {
  return SetMetadata(ROUTE_POLICY_KEY, policy);
};
