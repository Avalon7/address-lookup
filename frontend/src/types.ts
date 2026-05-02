export interface AddressResult {
  location: {
    latitude: number;
    longitude: number;
  };
  suburb: string | null;
  stateElectoralDistrict: string | null;
}
