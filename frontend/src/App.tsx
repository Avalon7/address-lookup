import { useAddressLookup } from './hooks/useAddressLookup';
import { AddressForm } from './components/AddressForm';
import { ResultCard } from './components/ResultCard';
import { ErrorMessage } from './components/ErrorMessage';

// Root component. Owns no state directly — delegates to useAddressLookup
// and passes values down to the relevant display components.
export default function App() {
  const { data, loading, error, lookup } = useAddressLookup();

  return (
    <div>
      <h1>NSW Address Lookup</h1>
      {/* Form is disabled during loading to prevent duplicate submissions */}
      <AddressForm onSubmit={lookup} disabled={loading} />
      {loading && <p>Loading...</p>}
      <ErrorMessage error={error} />
      <ResultCard result={data} />
    </div>
  );
}
