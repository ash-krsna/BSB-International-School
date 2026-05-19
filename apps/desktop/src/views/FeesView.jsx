export default function FeesView() {
  return (
    <section className="desktop-view">
      <div className="view-header">
        <div>
          <p className="desktop-eyebrow">Fees Management</p>
          <h1>Fast fee entry and receipt workflow</h1>
        </div>
        <button className="desktop-primary-button" type="button">Print Receipt</button>
      </div>

      <div className="desktop-grid">
        <article className="desktop-card">
          <h2>Fee Entry</h2>
          <div className="desktop-form-grid">
            <input placeholder="Student roll number" />
            <input placeholder="Installment amount" />
            <select defaultValue="cash">
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="net_banking">Net Banking</option>
            </select>
            <input placeholder="Reference number" />
            <button className="desktop-primary-button" type="button">Save Payment</button>
          </div>
        </article>
        <article className="desktop-card">
          <h2>Collection Summary</h2>
          <div className="desktop-data-list">
            <div><span>Total Fees</span><strong>Rs 18,40,000</strong></div>
            <div><span>Paid Amount</span><strong>Rs 13,58,000</strong></div>
            <div><span>Pending</span><strong>Rs 4,82,000</strong></div>
            <div><span>Discounts</span><strong>Rs 24,000</strong></div>
          </div>
        </article>
      </div>
    </section>
  );
}
