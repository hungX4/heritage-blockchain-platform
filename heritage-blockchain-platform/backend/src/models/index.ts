import { BlockchainRecord } from './blockchain-record.model.js';
import { Heritage } from './heritage.model.js';
import { HeritageVersion } from './heritage-version.model.js';
import { Organization } from './organization.model.js';
import { User } from './user.model.js';
import { Verification } from './verification.model.js';
import { ExpertSpecialization } from './expert-specialization.model.js';
import { Expert } from './expert.model.js';
import { HeritageFieldSpecialization } from './heritage-field-specialization.model.js';
import { HeritageField } from './heritage-fields.model.js';
import { Specialization } from './specialization.model.js';
import { OrganizationJoinRequest } from './organization-join-request.model.js';
import { HeritageMedia } from './heritage-media.model.js';
import { HeritageVersionMedia } from './heritage-version-media.model.js';

// Relationship mappings are handled via TypeORM decorators and/or queries.
export {
  BlockchainRecord,
  Heritage,
  HeritageVersion,
  Organization,
  User,
  Verification,
  ExpertSpecialization,
  Expert,
  HeritageField,
  HeritageFieldSpecialization,
  Specialization,
  OrganizationJoinRequest,
  HeritageMedia,
  HeritageVersionMedia
};
