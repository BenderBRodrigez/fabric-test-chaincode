import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Asset } from './asset';

@Info({ title: 'AssetTransfer', description: 'Smart contract for trading assets' })
export class AssetTransferContract extends Contract {

  @Transaction()
  public async InitLedger(ctx: Context) {
    const assets: Asset[] = [
      {
        id: 'asset1',
        text: 'read the fucking manuals!',
        owner: 'admin',
      },
      {
        id: 'asset2',
        text: 'some text',
        owner: 'admin',
      },
    ];
    for (const asset of assets) {
      asset.docType = 'asset';
      await ctx.stub.putState(asset.id, Buffer.from(JSON.stringify(asset)));
    }
  }

  @Transaction()
  public async CreateAsset(ctx: Context, assetString: string) {
    const asset: Asset = assetString && JSON.parse(assetString);
    asset.docType = 'asset';
    await ctx.stub.putState(asset.id, Buffer.from(JSON.stringify(asset)));
  }

  @Transaction(false)
  public async GetAsset(ctx: Context, id: string): Promise<string> {
    const assetJSON = await ctx.stub.getState(id);
    if (assetJSON?.length === 0) {
      throw new Error(`The asset ${id} does not exist`);
    }
    return assetJSON.toString();
  }

  @Transaction()
  public async UpdateAsset(ctx: Context, assetString: string): Promise<void> {
    const asset: Asset = assetString && JSON.parse(assetString);
    const exists = await this.GetAsset(ctx, asset.id);
    const updatedAsset = {
      ...JSON.parse(exists),
      ...asset,
    };
    return ctx.stub.putState(asset.id, Buffer.from(JSON.stringify(updatedAsset)));
  }

  @Transaction()
  public async DeleteAsset(ctx: Context, id: string): Promise<void> {
    const exists = await this.AssetExists(ctx, id);
    if (!exists) {
      throw new Error(`The asset ${id} does not exist`);
    }
    return ctx.stub.deleteState(id);
  }

  @Transaction(false)
  @Returns('boolean')
  public async AssetExists(ctx: Context, id: string): Promise<boolean> {
    const assetJSON = await ctx.stub.getState(id);
    return assetJSON?.length > 0;
  }

  @Transaction(false)
  @Returns('string')
  public async GetAllAssets(ctx: Context): Promise<string> {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      allResults.push({ key: result.value.key, record });
      result = await iterator.next();
    }
    return JSON.stringify(allResults);
  }
}
