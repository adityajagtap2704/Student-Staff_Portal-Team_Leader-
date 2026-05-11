"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Filter, Search, Calendar, CheckCircle2, AlertCircle, Clock, ChevronDown } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { staggerContainer, staggerItem, easeOut } from "@/components/motion/MotionConfig";

interface WebhookLog {
  id: number;
  event: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  payload: string;
  status: string;
  errorMessage?: string;
  processedAt?: string;
  receivedAt: string;
}

export default function PaymentLogsClient() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PROCESSED" | "FAILED" | "PENDING">("ALL");
  const [filterEvent, setFilterEvent] = useState<"ALL" | string>("ALL");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { error: showError } = useToast();

  // Fetch webhook logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/payments/webhook-logs?limit=100");

        if (!response.ok) {
          throw new Error("Failed to fetch webhook logs");
        }

        const data = await response.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching webhook logs:", err);
        showError("Failed to load webhook logs");
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

    // Filter by event
    if (filterEvent !== "ALL") {
      filtered = filtered.filter((l) => l.event === filterEvent);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.razorpayOrderId?.toLowerCase().includes(term) ||
          l.razorpayPaymentId?.toLowerCase().includes(term) ||
          l.event.toLowerCase().includes(term)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

    setFilteredLogs(filtered);
  }, [logs, searchTerm, filterStatus, filterEvent]);

  // Get unique events
  const events = Array.from(new Set(logs.map((l) => l.event)));

  // Calculate stats
  const stats = {
    totalWebhooks: logs.length,
    processedWebhooks: logs.filter((l) => l.status === "PROCESSED").length,
    failedWebhooks: logs.filter((l) => l.status === "FAILED").length,
    pendingWebhooks: logs.filter((l) => l.status === "PENDING").length,
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

  // Parse payload
  const parsePayload = (payload: string) => {
    try {
      return JSON.parse(payload);
    } catch {
      return { raw: payload };
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROCESSED":
        return <Badge variant="success" dot>Processed</Badge>;
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
      case "PROCESSED":
        return <CheckCircle2 size={16} className="text-emerald-600" />;
      case "FAILED":
        return <AlertCircle size={16} className="text-red-500" />;
      case "PENDING":
        return <Clock size={16} className="text-amber-500" />;
      default:
        return <CreditCard size={16} className="text-gray-400" />;
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
              <p className="text-xs text-gray-500 font-medium">Total Webhooks</p>
              <p className="text-2xl font-bold text-[#444] mt-1">{stats.totalWebhooks}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <CreditCard size={18} className="text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="bg-white rounded-2xl border border-gray-100 shadow-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Processed</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.processedWebhooks}</p>
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
              <p className="text-2xl font-bold text-red-500 mt-1">{stats.failedWebhooks}</p>
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
              <p className="text-2xl font-bold text-amber-500 mt-1">{stats.pendingWebhooks}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock size={18} className="text-amber-500" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Webhook Logs */}
      <Card title="Payment Webhook Events" subtitle="Debug payment processing issues" delay={0.1}>
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID or payment ID..."
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
              <option value="PROCESSED">Processed</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>

            {/* Event Filter */}
            {events.length > 0 && (
              <select
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
              >
                <option value="ALL">All Events</option>
                {events.map((event) => (
                  <option key={event} value={event}>
                    {event}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Logs List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
                <p className="text-sm text-gray-500">Loading webhook logs...</p>
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <CreditCard size={20} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No webhook logs found</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...easeOut, delay: index * 0.05 }}
                  className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-card transition-shadow"
                >
                  {/* Header */}
                  <button
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getStatusIcon(log.status)}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-700">{log.event}</span>
                          {getStatusBadge(log.status)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {log.razorpayOrderId && (
                            <span>Order: {log.razorpayOrderId.substring(0, 20)}...</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-500">{formatDate(log.receivedAt)}</span>
                      <motion.div
                        animate={{ rotate: expandedId === log.id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} className="text-gray-400" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedId === log.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-3"
                    >
                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {log.razorpayOrderId && (
                          <div>
                            <p className="text-xs font-medium text-gray-600">Order ID</p>
                            <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-700 block mt-1 break-all">
                              {log.razorpayOrderId}
                            </code>
                          </div>
                        )}
                        {log.razorpayPaymentId && (
                          <div>
                            <p className="text-xs font-medium text-gray-600">Payment ID</p>
                            <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-700 block mt-1 break-all">
                              {log.razorpayPaymentId}
                            </code>
                          </div>
                        )}
                        {log.processedAt && (
                          <div>
                            <p className="text-xs font-medium text-gray-600">Processed At</p>
                            <p className="text-xs text-gray-700 mt-1">{formatDate(log.processedAt)}</p>
                          </div>
                        )}
                        {log.errorMessage && (
                          <div>
                            <p className="text-xs font-medium text-red-600">Error</p>
                            <p className="text-xs text-red-700 mt-1">{log.errorMessage}</p>
                          </div>
                        )}
                      </div>

                      {/* Payload */}
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Payload</p>
                        <pre className="text-xs bg-white border border-gray-200 rounded p-2 overflow-x-auto text-gray-700">
                          {JSON.stringify(parsePayload(log.payload), null, 2)}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Results count */}
          {!loading && filteredLogs.length > 0 && (
            <div className="text-xs text-gray-500 text-center pt-2">
              Showing {filteredLogs.length} of {logs.length} webhooks
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
            <CreditCard size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">Payment Webhook Logs</p>
            <p className="text-xs text-blue-700 mt-0.5">
              View all payment webhook events from Razorpay. Use this to debug payment processing issues and track payment status changes.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
