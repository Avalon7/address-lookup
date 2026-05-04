import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';

export class AddressLookupStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // NodejsFunction uses esbuild to produce a single bundled JS file —
    // no need to zip node_modules manually before deploying.
    const handler = new NodejsFunction(this, 'Handler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../../backend/handler.ts'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(30),
      description: 'Resolves an NSW address to geographic and administrative boundary data',
      // projectRoot must point to the monorepo root so NodejsFunction can
      // locate the entry file outside the infrastructure/ directory.
      projectRoot: path.join(__dirname, '../..'),
      bundling: {
        // The backend only uses Node built-ins (https module) so there are
        // no npm packages to bundle or mark as external.
        externalModules: [],
      },
      // These env vars default to the real NSW API endpoints. Override them
      // in the Lambda console (or via cdk deploy --context) to point at a
      // broken/mock URL to simulate external API failures without touching code.
      environment: {
        NSW_GEOCODING_URL: 'https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Geocoded_Addressing_Theme/FeatureServer/1/query',
        NSW_ADMIN_BOUNDARIES_URL: 'https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Administrative_Boundaries_Theme/FeatureServer',
      },
    });

    // Function URL gives a direct HTTPS endpoint without API Gateway overhead.
    // No auth required as per the spec. CORS is configured here so the React
    // frontend can call it directly from the browser.
    const functionUrl = handler.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ['*'],
        allowedMethods: [lambda.HttpMethod.GET],
      },
    });

    // Printed after every deploy — paste this value into frontend/.env.production
    // as VITE_API_URL before building the frontend.
    new cdk.CfnOutput(this, 'FunctionUrl', {
      value: functionUrl.url,
      description: 'Lambda Function URL — set as VITE_API_URL in frontend/.env.production',
    });
  }
}
