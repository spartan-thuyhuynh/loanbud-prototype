import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { useAppData } from "@/app/contexts/AppDataContext";

interface FilterRule {
  field: "listingStatus" | "userType";
  value: string;
}

export function ContactList() {
  const { contacts } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, _setFilters] = useState<FilterRule[]>([]);
  // Filter contacts based on search and segment filters
  const filteredContacts = useMemo(() => {
    let result = contacts;

    // Apply search
    if (searchTerm) {
      result = result.filter(
        (c) =>
          c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.listingName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply filters (AND logic)
    filters.forEach((filter) => {
      result = result.filter((c) => c[filter.field] === filter.value);
    });

    return result;
  }, [contacts, searchTerm, filters]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6">
        <div className="flex items-center mb-4">
          <h2
            className="text-3xl mr-6"
            style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
          >
            Contact List
          </h2>
          <p className="text-muted-foreground mt-1">
            {filteredContacts.length} contacts
          </p>
        </div>
        {/* View Chips (Mock Examples) */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            "All Contacts",
            "My Leads",
            "Refferal Partners",
            "Saved View (1)",
          ].map((view, index) => (
            <div
              key={index}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border ${
                index === 0
                  ? "bg-primary/10 text-primary border-primary/20 font-semibold"
                  : "bg-muted text-muted-foreground border-border"
              }`}
              style={{ cursor: "pointer" }}
              // onClick: implement view switching logic here
            >
              {view}
            </div>
          ))}
        </div>
        {/* Search Bar and Add Button Inline */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ height: "38px" }}
            />
          </div>
          <Button
            variant="outline"
            className="px-3 py-1.5 text-sm"
            onClick={() => {
              // Handle add contact button click
            }}
          >
            Apply Filters
          </Button>
          <Button
            variant="default"
            className="px-3 py-1.5 text-sm"
            onClick={() => {
              // Handle add contact button click
            }}
          >
            Add Contact
          </Button>
        </div>
      </div>

      {/* Contact Table */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th
                  className="px-6 py-4 text-left text-sm text-muted-foreground"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                >
                  Contact Name
                </th>
                <th
                  className="px-6 py-4 text-left text-sm text-muted-foreground"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                >
                  Role
                </th>
                <th
                  className="px-6 py-4 text-left text-sm text-muted-foreground"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                >
                  Company
                </th>
                <th
                  className="px-6 py-4 text-left text-sm text-muted-foreground"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                >
                  Phone
                </th>
                <th
                  className="px-6 py-4 text-left text-sm text-muted-foreground"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                >
                  Email
                </th>

                <th
                  className="px-6 py-4 text-left text-sm text-muted-foreground"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                >
                  Create As
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredContacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-blue-600">
                      {contact.firstName} {contact.lastName}
                    </div>

                    {contact.optedOut && (
                      <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded-full border border-destructive/30">
                        Opted Out
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{contact.userType}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{contact.listingName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm  text-blue-600">
                      {contact.phone}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm  text-blue-600">
                      {contact.email}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm">
                      {contact.createAt?.toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredContacts.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <p>No contacts match your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
