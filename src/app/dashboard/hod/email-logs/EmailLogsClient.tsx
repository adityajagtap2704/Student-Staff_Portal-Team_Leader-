"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Filter, Search, Calendar, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { staggerContainer, staggerItem, easeOut } from "@/components/motion/MotionConfig";

interface EmailLog {
  id: number;
  recipientEmail: string;
  subject: string;
  emailType: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  status: string;
  errorMessage?: string;
  sentAt: string;
}

export default function EmailLogsClient() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "SENT" | "FAILED" | "PENDING">("ALL");
  const [filterType, setFilterType] = useState<"ALL" | string>("ALL");
  const { error: showError } = useToast();

  // Fetch email logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/email-logs?limit=100");

        if (!response.ok) {
          throw new Error("Failed to fetch email logs");
        }

        const data = await response.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching email logs:", err);
        showError("Failed to load email logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [showError]);

  // Filter logs
  useEffect(() => {
    let filtered = logs;

    // Filter by status
    if (filterStatus !== "ALL") {
      filtered = filtered.filter((l) => l.status === filterStatus);
    }

    // Filter by email type
    if (filterType !== "ALL") {
      filtered = filtered.filter((l) => l.emailType === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.recipientEmail.toLowerCase().includes(term) ||
          l.subject.toLowerCase().includes(term)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

    setFilteredLogs(filtered);
  }, [logs, searchTerm, filterStatus, filterType]);

  // Get unique email types
  const emailTypes = Array.from(new Set(logs.map((l) => l.emailType)));

  // Calculate stats
  const stats = {
    totalEmails: logs.length,
    sentEmails: logs.filter((l) => l.status === "SENT").length,
    failedEmails: logs.filter((l) => l.status === "FAILED").length,
    pendingEmails: logs.filter((l) => l.status === "PENDING").length,
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
        return <Badge variant="success" dot>Sent</Badge>;
      case "FAILED":
        return <Badge variant="danger" dot>Failed</Badge>;
      case "PENDING":
        return <Badge variant="warning" dot>Pending</Badge>;
      default:
        return <Badge variant="info" dot>{status}</Badge>;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SENT":
        return <CheckCircle2 size={16} className="text-emerald-600" />;
      case "FAILED":
        return <AlertCircle size={16} className="text-red-500" />;
      case "PENDING":
        return <Clock size={16} className="text-amber-500" />;
      default:
        return <Mail size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-2xl border border-gray-100 shadow-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Emails</p>
              <p className="text-2xl font-bold text-[#444] mt-1">{stats.totalEmails}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Mail size={18} className="text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="bg-white rounded-2xl border border-gray-100 shadow-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Sent</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.sentEmails}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-emerald-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="bg-white rounded-2xl border border-gray-100 shadow-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Failed</p>
              <p className="text-2xl font-bold text-red-500 mt-1">{stats.failedEmails}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertCircle size={18} className="text-red-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="bg-white rounded-2xl border border-gray-100 shadow-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Pending</p>
              <p className="text-2xl font-bold text-amber-500 mt-1">{stats.pendingEmails}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock size={18} className="text-amber-500" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Email Logs Table */}
      <Card title="Email Audit Trail" subtitle="System email logs and delivery status" delay={0.1}>
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="SENT">Sent</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>

            {/* Email Type Filter */}
            {emailTypes.length > 0 && (
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
              >
                <option value="ALL">All Types</option>
                {emailTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Logs Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
                <p className="text-sm text-gray-500">Loading email logs...</p>
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No email logs found</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Recipient</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Subject</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, index) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...easeOut, delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-gray-700">{formatDate(log.sentAt)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {log.recipientEmail}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700 truncate max-w-xs">{log.subject}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="neutral">{log.emailType}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          {getStatusBadge(log.status)}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Results count */}
          {!loading && filteredLogs.length > 0 && (
            <div className="text-xs text-gray-500 text-center pt-2">
              Showing {filteredLogs.length} of {logs.length} emails
            </div>
          )}
        </div>
      </Card>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...easeOut, delay: 0.2 }}
        className="bg-blue-50 border border-blue-200 rounded-2xl p-4"
      >
        <div className="flex gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <Mail size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">Email Audit Trail</p>
            <p className="text-xs text-blue-700 mt-0.5">
              This log shows all system-generated emails including admission confirmations, leave approvals, and notifications. Use filters to find specific emails.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
