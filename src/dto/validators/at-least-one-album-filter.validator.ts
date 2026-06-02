import { ValidatorConstraint } from 'class-validator';
import type {
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator';
import type { AlbumSearchDto } from '../album-search.dto';

@ValidatorConstraint({ name: 'atLeastOneAlbumFilter', async: false })
export class AtLeastOneAlbumFilterConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const dto = args.object as AlbumSearchDto;
    return (
      dto.q !== undefined || dto.artist !== undefined || dto.year !== undefined
    );
  }

  defaultMessage(): string {
    return 'at least one of q, artist or year must be provided';
  }
}
