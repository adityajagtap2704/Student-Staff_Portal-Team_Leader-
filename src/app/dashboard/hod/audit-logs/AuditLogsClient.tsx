"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Search, Filter, Calendar, User, Database } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { staggerContainer, staggerItem, easeOut } from "@/components/motion/MotionConfig";

interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  userId?: number;
  userRole: string;
  oldValue?: string;
  newValue?: string;
  details?: string;
  timestamp: string;
}

export default function AuditLogsClient() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<"ALL" | string>("ALL");
  const [filterEntity, setFilterEntity] = useState<"ALL" | string>("ALL");
  const { error: showError } = useToast();

  // Fetch audit logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/audit-logs?limit=100");

        if (!response.ok) {
          throw new Error("Failed to fetch audit logs");
        }

        const data = await response.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching audit logs:", err);
        showError("Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [showError]);

  // Filter logs
  useEffect(() => {
    let filtered = logs;

    // Filter by action
    if (filterAction !== "ALL") {
      filtered = filtered.filter((l) => l.action === filterAction);
    }

    // Filter by entity type
    if (filterEntity !== "ALL") {
      filtered = filtered.filter((l) => l.entityType === filterEntity);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.action.toLowerCase().includes(term) ||
          l.entityType.toLowerCase().includes(term) ||
          l.details?.toLowerCase().includes(term)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredLogs(filtered);
  }, [logs, searchTerm, filterAction, filterEntity]);

  // Get unique actions and entities
  const actions = Array.from(new Set(logs.map((l) => l.action)));
  const entities = Array.from(new Set(logs.map((l) => l.entityType)));

  // Calculate stats
  const stats = {
    totalActions: logs.length,
    uniqueUsers: new Set(logs.map((l) => l.userId)).size,
    uniqueEntities: entities.length,
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

  // Get action badge color
  const getActionBadge = (action: string) => {
    switch (action.toUpperCase()) {
      case "CREATE":
        return <Badge variant="success" dot>Create</Badge>;
      case "UPDATE":
        return <Badge variant="info" dot>Update</Badge>;
      case "DELETE":
        return <Badge variant="danger" dot>Delete</Badge>;
      case "APPROVE":
        return <Badge variant="success" dot>Approve</Badge>;
      case "REJECT":
        return <Badge variant="danger" dot>Reject</Badge>;
      default:
        return <Badge variant="neutral" dot>{action}</Badge>;
    }
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "STUDENT":
        return <Badge variant="neutral">Student</Badge>;
      case "CLASS_TEACHER":
        return <Badge variant="neutral">Teacher</Badge>;
      case "HOD":
        return <Badge variant="neutral">HOD</Badge>;
      default:
        return <Badge variant="neutral">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
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
              <p className="text-xs text-gray-500 font-medium">Total Actions</p>
              <p className="text-2xl font-bold text-[#444] mt-1">{stats.totalActions}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Activity size={18} className="text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="bg-white rounded-2xl border border-gray-100 shadow-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Active Users</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.uniqueUsers}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <User size={18} className="text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="bg-white rounded-2xl border border-gray-100 shadow-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Entity Types</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.uniqueEntities}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Database size={18} className="text-emerald-600" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Audit Logs */}
      <Card title="System Audit Trail" subtitle="Track all system activities and changes" delay={0.1}>
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by action, entity, or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Action Filter */}
            {actions.length > 0 && (
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
              >
                <option value="ALL">All Actions</option>
                {actions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            )}

            {/* Entity Filter */}
            {entities.length > 0 && (
              <select
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
              >
                <option value="ALL">All Entities</option>
                {entities.map((entity) => (
                  <option key={entity} value={entity}>
                    {entity}
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
                <p className="text-sm text-gray-500">Loading audit logs...</p>
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Activity size={20} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No audit logs found</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Timestamp</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Action</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Entity</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">User Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Details</th>
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
                          <span className="text-gray-700">{formatDate(log.timestamp)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-700">{log.entityType}</p>
                          <p className="text-xs text-gray-500">ID: {log.entityId}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getRoleBadge(log.userRole)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600 truncate max-w-xs">
                          {log.details || "N/A"}
                        </span>
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
              Showing {filteredLogs.length} of {logs.length} audit logs
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
            <Activity size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">System Audit Trail</p>
            <p className="text-xs text-blue-700 mt-0.5">
              Complete record of all system activities including creates, updates, deletes, and approvals. Use filters to find specific actions.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
