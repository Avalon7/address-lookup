#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { AddressLookupStack } from '../lib/address-lookup-stack';

const app = new cdk.App();

new AddressLookupStack(app, 'AddressLookupStack', {
  // Pin to a specific account and region so CDK environment-dependent
  // features (e.g. Lambda Function URLs) resolve correctly at synth time.
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
