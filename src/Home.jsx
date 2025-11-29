import React, { useEffect, useState } from "react";
import { listDonations, listRequests, listDeliveries } from "./api.js";
import Loader from "./Loader.jsx";

export default function Home() {
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [d, r, dl] = await Promise.all([
        listDonations(),
        listRequests(),
        listDeliveries(),
      ]);

      setCounts({
        donations: d.length,
        requests: r.length,
        deliveries: dl.length,
      });

      setLoading(false);
    })();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="page">
      <div className="grid grid-3">
        <div className="card">
          <h2>Total Donations</h2>
          <p className="small">All donations submitted</p>
          <h1>{counts.donations}</h1>
        </div>

        <div className="card">
          <h2>Total Requests</h2>
          <p className="small">All help requests received</p>
          <h1>{counts.requests}</h1>
        </div>

        <div className="card">
          <h2>Deliveries</h2>
          <p className="small">Assignments created</p>
          <h1>{counts.deliveries}</h1>
        </div>
      </div>
    </div>
  );
}
