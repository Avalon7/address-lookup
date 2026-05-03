import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AddressLookupStack } from '../lib/address-lookup-stack';

describe('AddressLookupStack', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new AddressLookupStack(app, 'TestStack');
    template = Template.fromStack(stack);
  });

  it('creates a Node.js 20 Lambda function', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs20.x',
      Handler: 'index.handler',
    });
  });

  it('creates a Lambda Function URL with no auth and CORS enabled', () => {
    template.hasResourceProperties('AWS::Lambda::Url', {
      AuthType: 'NONE',
      Cors: {
        AllowOrigins: ['*'],
        AllowMethods: ['GET'],
      },
    });
  });

  it('outputs the Function URL', () => {
    template.hasOutput('FunctionUrl', {});
  });
});
