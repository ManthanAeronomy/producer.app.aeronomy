"use client";

import { useState } from "react";

type TabType = "company" | "users" | "approvals" | "notifications";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "sales" | "operations" | "finance" | "viewer";
  status: "active" | "invited" | "disabled";
  lastActive?: string;
}

const demoUsers: User[] = [
  { id: "u1", name: "Jane Doe", email: "jane.doe@greensky.bio", role: "admin", status: "active", lastActive: "2 hours ago" },
  { id: "u2", name: "John Smith", email: "john.smith@greensky.bio", role: "finance", status: "active", lastActive: "1 day ago" },
  { id: "u3", name: "Mike Johnson", email: "mike.johnson@greensky.bio", role: "operations", status: "active", lastActive: "3 hours ago" },
  { id: "u4", name: "Sarah Williams", email: "sarah.w@greensky.bio", role: "sales", status: "invited" },
];

interface ApprovalRule {
  id: string;
  name: string;
  trigger: string;
  approvers: string[];
  mode: "sequential" | "parallel";
  enabled: boolean;
}

const demoApprovalRules: ApprovalRule[] = [
  {
    id: "ar1",
    name: "High Value Bids",
    trigger: "Contract value > €5M",
    approvers: ["Jane Doe (Sales Director)", "John Smith (CFO)"],
    mode: "sequential",
    enabled: true,
  },
  {
    id: "ar2",
    name: "Low Margin Bids",
    trigger: "Margin < 10%",
    approvers: ["Jane Doe (Sales Director)"],
    mode: "sequential",
    enabled: true,
  },
  {
    id: "ar3",
    name: "New Customer",
    trigger: "First contract with buyer",
    approvers: ["Jane Doe (Sales Director)", "Mike Johnson (Operations)"],
    mode: "parallel",
    enabled: false,
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("company");
  const [users] = useState(demoUsers);
  const [approvalRules] = useState(demoApprovalRules);

  // Company Profile State
  const [companyName, setCompanyName] = useState("GreenSky Bio Fuels");
  const [legalName, setLegalName] = useState("GreenSky Bio Fuels B.V.");
  const [registrationNumber, setRegistrationNumber] = useState("NL-12345678");
  const [vatNumber, setVatNumber] = useState("NL123456789B01");
  const [address, setAddress] = useState("Europoort 123, 3198 LG Rotterdam, Netherlands");
  const [website, setWebsite] = useState("https://greensky.bio");
  const [primaryContact, setPrimaryContact] = useState("Jane Doe");
  const [primaryEmail, setPrimaryEmail] = useState("contact@greensky.bio");
  const [primaryPhone, setPrimaryPhone] = useState("+31 10 123 4567");

  const getRoleBadge = (role: User["role"]) => {
    const styles = {
      admin: "bg-[#9c27b0]/10 text-[#9c27b0]",
      sales: "bg-[#0176d3]/10 text-[#0176d3]",
      operations: "bg-[#ff9800]/10 text-[#e65100]",
      finance: "bg-[#2e844a]/10 text-[#2e844a]",
      viewer: "bg-[#706e6b]/10 text-[#706e6b]",
    };
    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[role]}`}>
        {role}
      </span>
    );
  };

  const getStatusBadge = (status: User["status"]) => {
    const styles = {
      active: "bg-[#e8f5e9] text-[#2e844a]",
      invited: "bg-[#fff3e0] text-[#e65100]",
      disabled: "bg-[#f3f2f2] text-[#706e6b]",
    };
    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-[#181818]">Settings</h1>
        <p className="mt-1 text-base text-[#706e6b]">
          Manage your company profile, users, and platform preferences
        </p>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 border-b border-[#e5e5e5]">
          {(
            [
              { id: "company", label: "Company Profile" },
              { id: "users", label: "Users & Roles" },
              { id: "approvals", label: "Approval Rules" },
              { id: "notifications", label: "Notifications" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-[#0176d3]"
                  : "text-[#706e6b] hover:text-[#181818]"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0176d3]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "company" && (
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#181818]">Company Profile</h2>
          <p className="text-sm text-[#706e6b]">
            This information will be displayed on contracts and official documents
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
              Company Name
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
              Legal Entity Name
              <input
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
              Registration Number
              <input
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
              VAT Number
              <input
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
                className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-[#3e3e3c] md:col-span-2">
              Registered Address
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
              Website
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
              />
            </label>
          </div>

          <div className="mt-8 border-t border-[#e5e5e5] pt-6">
            <h3 className="text-sm font-semibold text-[#181818]">Primary Contact</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                Name
                <input
                  value={primaryContact}
                  onChange={(e) => setPrimaryContact(e.target.value)}
                  className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
                />
              </label>
              <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                Email
                <input
                  type="email"
                  value={primaryEmail}
                  onChange={(e) => setPrimaryEmail(e.target.value)}
                  className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
                />
              </label>
              <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                Phone
                <input
                  value={primaryPhone}
                  onChange={(e) => setPrimaryPhone(e.target.value)}
                  className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
                />
              </label>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button className="rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm font-semibold text-[#706e6b] hover:bg-[#f3f2f2]">
              Cancel
            </button>
            <button className="rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#014486]">
              Save Changes
            </button>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#181818]">Users & Roles</h2>
              <p className="text-sm text-[#706e6b]">
                Manage team members and their access levels
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#014486]">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Invite User
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-[#e5e5e5]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#e5e5e5] bg-[#f8f9fa]">
                <tr>
                  <th className="px-4 py-3 font-semibold text-[#706e6b]">User</th>
                  <th className="px-4 py-3 font-semibold text-[#706e6b]">Role</th>
                  <th className="px-4 py-3 font-semibold text-[#706e6b]">Status</th>
                  <th className="px-4 py-3 font-semibold text-[#706e6b]">Last Active</th>
                  <th className="px-4 py-3 font-semibold text-[#706e6b]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#f8f9fa]">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0176d3]/10 text-sm font-bold text-[#0176d3]">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-[#181818]">{user.name}</p>
                          <p className="text-xs text-[#706e6b]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-4">{getStatusBadge(user.status)}</td>
                    <td className="px-4 py-4 text-[#706e6b]">{user.lastActive || "—"}</td>
                    <td className="px-4 py-4">
                      <button className="text-sm font-medium text-[#0176d3] hover:underline">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 rounded-lg bg-[#f8f9fa] p-4">
            <h3 className="text-sm font-semibold text-[#181818]">Role Permissions</h3>
            <ul className="mt-2 space-y-1 text-sm text-[#706e6b]">
              <li><span className="font-medium text-[#9c27b0]">Admin:</span> Full access to all features and settings</li>
              <li><span className="font-medium text-[#0176d3]">Sales:</span> Manage RFQs, bids, and contracts</li>
              <li><span className="font-medium text-[#e65100]">Operations:</span> Manage production batches and deliveries</li>
              <li><span className="font-medium text-[#2e844a]">Finance:</span> View contracts, manage invoicing</li>
              <li><span className="font-medium text-[#706e6b]">Viewer:</span> Read-only access to all data</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === "approvals" && (
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#181818]">Approval Rules</h2>
              <p className="text-sm text-[#706e6b]">
                Configure when bids require internal approval before submission
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#014486]">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Rule
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {approvalRules.map((rule) => (
              <div
                key={rule.id}
                className={`rounded-lg border p-5 ${
                  rule.enabled ? "border-[#e5e5e5] bg-white" : "border-[#e5e5e5] bg-[#f8f9fa]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-[#181818]">{rule.name}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          rule.enabled
                            ? "bg-[#e8f5e9] text-[#2e844a]"
                            : "bg-[#f3f2f2] text-[#706e6b]"
                        }`}
                      >
                        {rule.enabled ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#706e6b]">Trigger: {rule.trigger}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-xs font-semibold text-[#706e6b] hover:bg-[#f3f2f2]">
                      Edit
                    </button>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" checked={rule.enabled} className="peer sr-only" readOnly />
                      <div className="peer h-6 w-11 rounded-full bg-[#e5e5e5] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#0176d3] peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                    Approvers ({rule.mode})
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {rule.approvers.map((approver, i) => (
                      <span key={i} className="rounded-full bg-[#f3f2f2] px-3 py-1 text-xs font-medium text-[#181818]">
                        {i + 1}. {approver}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#181818]">Notification Preferences</h2>
          <p className="text-sm text-[#706e6b]">
            Choose how and when you want to be notified
          </p>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[#181818]">Email Notifications</h3>
              <div className="mt-3 space-y-3">
                {[
                  { label: "New RFQ matches your criteria", enabled: true },
                  { label: "Bid approval required", enabled: true },
                  { label: "Bid decision received (won/lost)", enabled: true },
                  { label: "Delivery reminder (3 days before)", enabled: true },
                  { label: "Certificate expiring (30 days)", enabled: true },
                  { label: "Weekly pipeline summary", enabled: false },
                ].map((item, i) => (
                  <label key={i} className="flex items-center justify-between rounded-lg border border-[#e5e5e5] px-4 py-3">
                    <span className="text-sm text-[#181818]">{item.label}</span>
                    <input
                      type="checkbox"
                      defaultChecked={item.enabled}
                      className="h-4 w-4 rounded text-[#0176d3]"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#181818]">In-App Notifications</h3>
              <div className="mt-3 space-y-3">
                {[
                  { label: "Real-time bid updates", enabled: true },
                  { label: "Contract milestone alerts", enabled: true },
                  { label: "Production batch logged", enabled: false },
                ].map((item, i) => (
                  <label key={i} className="flex items-center justify-between rounded-lg border border-[#e5e5e5] px-4 py-3">
                    <span className="text-sm text-[#181818]">{item.label}</span>
                    <input
                      type="checkbox"
                      defaultChecked={item.enabled}
                      className="h-4 w-4 rounded text-[#0176d3]"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button className="rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm font-semibold text-[#706e6b] hover:bg-[#f3f2f2]">
              Reset to Defaults
            </button>
            <button className="rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#014486]">
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}










