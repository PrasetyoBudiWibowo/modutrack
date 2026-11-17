"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import Toolbar from "@/src/components/data-table/toolbar";
import { DataTable } from "@/src/components/data-table/data-table";
import { userColumns } from "@/src/components/data-table/columns/user/userColumns";
import ModalBlokirUser from "@/src/components/ui/user/modal/ModalBlokirUser";
import ModalCabutBlokir from "@/src/components/ui/user/modal/ModalCabutBlokir";
import ModalRiwayatBlokir from "@/src/components/ui/user/modal/ModalRiwayatBlokir";
import ModalEditUser from "@/src/components/ui/user/modal/ModalEditUser";
import {
  aktifkanUser,
  getManagedUsers,
  nonaktifkanUser,
  type ManagedUser,
} from "@/service/user/userManagementService";
import { getErrorMessage } from "@/src/lib/errorMessage";
import { getUserState, type UserState } from "@/src/lib/userStatus";

export default function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | UserState>("");
  const [editTarget, setEditTarget] = useState<ManagedUser | null>(null);

  const [blokirTarget, setBlokirTarget] = useState<ManagedUser | null>(null);
  const [cabutTarget, setCabutTarget] = useState<ManagedUser | null>(null);
  const [riwayatTarget, setRiwayatTarget] = useState<ManagedUser | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getManagedUsers();
      setUsers(res.data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredData = useMemo(
    () =>
      users.filter((u) => {
        const matchSearch = u.user_name
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchStatus = filterStatus
          ? getUserState(u) === filterStatus
          : true;
        return matchSearch && matchStatus;
      }),
    [users, search, filterStatus],
  );

  const handleToggleStatus = useCallback(
    async (u: ManagedUser) => {
      const aktifkan = getUserState(u) === "NONAKTIF";

      const confirm = await Swal.fire({
        title: aktifkan ? "Aktifkan user?" : "Nonaktifkan user?",
        text: aktifkan
          ? `${u.user_name} dapat login kembali.`
          : `${u.user_name} tidak dapat login dan sesinya langsung berakhir.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya",
        cancelButtonText: "Batal",
      });

      if (!confirm.isConfirmed) return;

      try {
        const result = aktifkan
          ? await aktifkanUser(u.kd_user)
          : await nonaktifkanUser(u.kd_user);

        if (!result.status) {
          Swal.fire({ icon: "error", title: "Gagal", text: result.message });
          return;
        }

        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: result.message,
          timer: 1500,
          showConfirmButton: false,
        });

        await loadUsers();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: getErrorMessage(error),
        });
      }
    },
    [loadUsers],
  );

  const columns = useMemo(
    () =>
      userColumns({
        onToggleStatus: handleToggleStatus,
        onBlokir: setBlokirTarget,
        onCabut: setCabutTarget,
        onRiwayat: setRiwayatTarget,
        onEdit: setEditTarget,
      }),
    [handleToggleStatus],
  );

  return (
    <div className="space-y-6">
      {blokirTarget && (
        <ModalBlokirUser
          key={blokirTarget.user_name}
          user={blokirTarget}
          onClose={() => setBlokirTarget(null)}
          onSuccess={loadUsers}
        />
      )}

      {cabutTarget && (
        <ModalCabutBlokir
          key={cabutTarget.user_name}
          user={cabutTarget}
          onClose={() => setCabutTarget(null)}
          onSuccess={loadUsers}
        />
      )}

      {riwayatTarget && (
        <ModalRiwayatBlokir
          key={riwayatTarget.user_name}
          user={riwayatTarget}
          onClose={() => setRiwayatTarget(null)}
        />
      )}

      {editTarget && (
        <ModalEditUser
          key={editTarget.user_name}
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={loadUsers}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-800">Pengaturan User</h1>
        <p className="mt-1 text-sm text-gray-500">
          Nonaktifkan, blokir, dan pantau status user
        </p>
      </div>

      <Toolbar
        search={search}
        setSearch={setSearch}
        totalData={filteredData.length}
        loading={loading}
        onRefresh={loadUsers}>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "" | UserState)}
          className="min-w-[160px] rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100">
          <option value="">Semua Status</option>
          <option value="AKTIF">Aktif</option>
          <option value="NONAKTIF">Nonaktif</option>
          <option value="SUSPEND">Suspend</option>
          <option value="DIBLOKIR">Diblokir</option>
        </select>
      </Toolbar>

      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        title="Daftar User"
        description="Kelola status akun user"
      />
    </div>
  );
}
