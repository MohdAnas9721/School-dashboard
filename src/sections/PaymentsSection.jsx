import { useMemo, useState } from "react";

export function PaymentsSection({ feeForm, setFeeForm, onSubmitFee, feeStatus, fees }) {
  const [search, setSearch] = useState("");

  const filteredFees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return fees;
    }

    return fees.filter((item) => {
      const hay = `${item.studentName} ${item.className} ${item.rollNo} ${item.paymentMode}`.toLowerCase();
      return hay.includes(query);
    });
  }, [fees, search]);

  return (
    <section className="section-shell">
      <h2>Payment</h2>
      <div className="split-grid">
        <article className="panel">
          <h3>Submit Fee</h3>
          <form className="form-grid" onSubmit={onSubmitFee}>
            <input
              placeholder="Student Name"
              value={feeForm.studentName}
              onChange={(event) => setFeeForm({ ...feeForm, studentName: event.target.value })}
              required
            />
            <input
              placeholder="Class"
              value={feeForm.className}
              onChange={(event) => setFeeForm({ ...feeForm, className: event.target.value })}
              required
            />
            <input
              placeholder="Roll Number"
              value={feeForm.rollNo}
              onChange={(event) => setFeeForm({ ...feeForm, rollNo: event.target.value })}
              required
            />
            <input
              type="number"
              min="1"
              placeholder="Amount"
              value={feeForm.amount}
              onChange={(event) => setFeeForm({ ...feeForm, amount: event.target.value })}
              required
            />
            <select
              value={feeForm.paymentMode}
              onChange={(event) => setFeeForm({ ...feeForm, paymentMode: event.target.value })}
            >
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="NetBanking">Net Banking</option>
            </select>
            <button type="submit">Save Fee</button>
          </form>
          <p className="status-text">{feeStatus}</p>
        </article>

        <article className="panel">
          <h3>Fee Search</h3>
          <input
            placeholder="Search by student, class, roll, mode"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="table-wrap table-margin">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Roll</th>
                  <th>Amount</th>
                  <th>Mode</th>
                </tr>
              </thead>
              <tbody>
                {filteredFees.map((item) => (
                  <tr key={item.id}>
                    <td>{item.studentName}</td>
                    <td>{item.className}</td>
                    <td>{item.rollNo}</td>
                    <td>Rs. {item.amount}</td>
                    <td>{item.paymentMode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredFees.length === 0 && <p className="empty-text">No matching fee records.</p>}
          </div>
        </article>
      </div>
    </section>
  );
}
