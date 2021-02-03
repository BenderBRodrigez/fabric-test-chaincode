import { Object, Property } from 'fabric-contract-api';

@Object()
export class Asset {
  @Property()
  public docType?: string;

  @Property()
  public id: string;

  @Property()
  public text: string;

  @Property()
  public owner: string;

}
