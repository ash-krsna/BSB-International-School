import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

export default function TransportView({ token }) {
  const [routes, setRoutes] = useState([]);
  const [collections, setCollections] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest("/transport/routes", { token }),
      apiRequest("/transport/collections", { token })
    ])
      .then(([routeData, collectionData]) => {
        if (!active) {
          return;
        }
        setRoutes(routeData.data || []);
        setCollections(collectionData.data || []);
      })
      .catch((error) => {
        if (active) {
          setMessage(error.message);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <section className="desktop-view">
      <div className="view-header">
        <div>
          <p className="desktop-eyebrow">Bus & Driver Portal</p>
          <h1>Route-wise students, driver pickup lists, and monthly bus collections</h1>
        </div>
        <button className="desktop-primary-button" type="button">Assign Student</button>
      </div>

      {message ? <p className="desktop-error">{message}</p> : null}

      <div className="desktop-grid">
        <article className="desktop-card">
          <div className="card-head">
            <h2>Active Routes</h2>
            <span>{routes.length} routes</span>
          </div>
          <div className="desktop-table-wrap">
            <table className="desktop-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Driver</th>
                  <th>Students</th>
                  <th>Monthly Fee</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr key={route.id}>
                    <td>{route.routeName}</td>
                    <td>{route.driverName || "Not assigned"}</td>
                    <td>{route.activeStudentCount}</td>
                    <td>Rs {Number(route.monthlyFee || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="desktop-card">
          <div className="card-head">
            <h2>Bus Collections</h2>
            <span>Commission tracking</span>
          </div>
          <div className="desktop-table-wrap">
            <table className="desktop-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Route</th>
                  <th>Collected</th>
                  <th>School Commission</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((item, index) => (
                  <tr key={`${item.routeName}-${item.collectionMonth}-${index}`}>
                    <td>{item.collectionMonth || "-"}</td>
                    <td>{item.routeName}</td>
                    <td>Rs {Number(item.collectedAmount || 0).toLocaleString()}</td>
                    <td>Rs {Number(item.schoolCommission || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
}
