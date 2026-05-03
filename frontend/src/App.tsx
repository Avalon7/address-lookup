import './App.css';
import { useAddressLookup } from './hooks/useAddressLookup';
import { AddressForm } from './components/AddressForm';
import { ResultCard } from './components/ResultCard';
import { ErrorMessage } from './components/ErrorMessage';

export default function App() {
  const { data, loading, error, lookup } = useAddressLookup();

  return (
    <>
      <main className="page">
        <div className="container">
          <div className="header">
            <h1>Address Lookup</h1>
            <p className="header__subtitle">Enter a NSW address to get coordinates and administrative boundaries.</p>
          </div>

          <AddressForm onSubmit={lookup} disabled={loading} />
          {loading && <p className="loading">Looking up address…</p>}
          <ErrorMessage error={error} />
          <ResultCard result={data} />
        </div>
      </main>
    </>
  );
}
