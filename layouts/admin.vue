<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <!-- Mobile Sidebar Backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileOpen"
        @click="mobileOpen = false"
        class="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
      ></div>
    </Transition>

    <!-- Colored Left Sidebar (Deep Navy) -->
    <aside
      :class="[
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-64',
        'fixed inset-y-0 left-0 z-50 w-64 bg-[#0B192C] text-slate-200 border-r border-slate-800/80 shadow-xl lg:shadow-none flex flex-col transition-all duration-200 ease-out'
      ]"
    >
      <!-- Sidebar Brand Header -->
      <div
        :class="[
          isCollapsed ? 'justify-center px-2' : 'justify-between px-4',
          'h-16 flex items-center border-b border-white/10 shrink-0 transition-all duration-200'
        ]"
      >
        <NuxtLink
          to="/dashboard"
          @click="mobileOpen = false"
          :title="isCollapsed ? 'Digital Arsip — Dashboard' : undefined"
          :class="['flex items-center min-w-0', isCollapsed ? 'justify-center' : 'gap-3']"
        >
          <img
            v-if="settings.logo"
            :src="companyLogoUrl"
            alt="Logo Instansi"
            class="h-9 w-9 rounded-lg object-cover ring-1 ring-white/20 shrink-0 bg-white"
          />
          <div
            v-else
            class="h-9 w-9 rounded-lg bg-sky-500/15 ring-1 ring-sky-400/30 flex items-center justify-center text-sky-400 shrink-0"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <div v-if="!isCollapsed" class="min-w-0">
            <div class="font-bold text-white text-sm tracking-tight truncate leading-tight">
              Digital Arsip
            </div>
            <div class="text-[11px] text-slate-400 truncate mt-0.5">
              {{ settings.name || 'Sistem Arsip Digital' }}
            </div>
          </div>
        </NuxtLink>

        <button
          type="button"
          @click="mobileOpen = false"
          aria-label="Tutup menu"
          class="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Sidebar Navigation -->
      <nav
        :class="[
          isCollapsed ? 'px-2.5 space-y-3' : 'px-3 space-y-6',
          'sidebar-scroll flex-1 overflow-y-auto overflow-x-hidden py-4 text-sm font-medium'
        ]"
      >
        <!-- Menu Utama -->
        <div class="space-y-1">
          <div v-if="!isCollapsed" class="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400/90">
            Menu Utama
          </div>

          <NuxtLink
            to="/dashboard"
            @click="mobileOpen = false"
            title="Dashboard"
            :class="navItemClass('/dashboard', true)"
          >
            <svg
              :class="navIconClass('/dashboard', true)"
              class="w-[18px] h-[18px] shrink-0 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span v-if="!isCollapsed" class="truncate">Dashboard</span>
          </NuxtLink>

          <NuxtLink
            v-if="hasPermission('view_any_arsip')"
            to="/dashboard/arsip"
            @click="mobileOpen = false"
            title="Arsip"
            :class="navItemClass('/dashboard/arsip')"
          >
            <span :class="isCollapsed ? 'flex items-center justify-center' : 'flex items-center gap-3 min-w-0'">
              <svg
                :class="navIconClass('/dashboard/arsip')"
                class="w-[18px] h-[18px] shrink-0 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              <span v-if="!isCollapsed" class="truncate">Arsip</span>
            </span>
            <span
              v-if="!isCollapsed"
              :class="[
                isNavActive('/dashboard/arsip') ? 'bg-sky-400/20 text-sky-200' : 'bg-white/10 text-slate-300',
                'ml-auto px-2 py-0.5 text-[11px] font-semibold rounded-md tabular-nums shrink-0'
              ]"
            >
              {{ activeArsips.length }}
            </span>
          </NuxtLink>

          <NuxtLink
            v-if="canCreateArsip"
            to="/dashboard/picture-to-pdf"
            @click="mobileOpen = false"
            title="Picture to PDF"
            :class="navItemClass('/dashboard/picture-to-pdf')"
          >
            <svg
              :class="navIconClass('/dashboard/picture-to-pdf')"
              class="w-[18px] h-[18px] shrink-0 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            <span v-if="!isCollapsed" class="truncate">Picture to PDF</span>
          </NuxtLink>

          <NuxtLink
            to="/dashboard/petunjuk-penggunaan"
            @click="mobileOpen = false"
            title="Petunjuk Penggunaan"
            :class="navItemClass('/dashboard/petunjuk-penggunaan')"
          >
            <svg
              :class="navIconClass('/dashboard/petunjuk-penggunaan')"
              class="w-[18px] h-[18px] shrink-0 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <span v-if="!isCollapsed" class="truncate">Petunjuk Penggunaan</span>
          </NuxtLink>
        </div>

        <!-- Collapsible Group: Manajemen Arsip -->
        <div v-if="hasPermission('view_any_kategori') || hasPermission('view_any_subjek') || hasPermission('view_any_arsip') || canRestoreArsip || canForceDeleteArsip">
          <button
            v-if="!isCollapsed"
            type="button"
            @click="groups.manajemen = !groups.manajemen"
            class="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span>Master Data</span>
            <svg
              :class="[groups.manajemen ? 'rotate-180' : '', 'w-3.5 h-3.5 transition-transform duration-150']"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-else class="my-2 border-t border-white/10 mx-2"></div>
          <div v-show="groups.manajemen || isCollapsed" :class="[!isCollapsed ? 'mt-1.5' : '', 'space-y-1']">
            <NuxtLink
              v-if="hasPermission('view_any_kategori')"
              to="/dashboard/kategori"
              @click="mobileOpen = false"
              title="Fungsi Arsip"
              :class="navItemClass('/dashboard/kategori')"
            >
              <span :class="isCollapsed ? 'flex items-center justify-center' : 'flex items-center gap-3 min-w-0'">
                <svg
                  :class="navIconClass('/dashboard/kategori')"
                  class="w-[18px] h-[18px] shrink-0 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                </svg>
                <span v-if="!isCollapsed" class="truncate">Fungsi Arsip</span>
              </span>
              <span
                v-if="!isCollapsed"
                :class="[
                  isNavActive('/dashboard/kategori') ? 'bg-sky-400/20 text-sky-200' : 'bg-white/10 text-slate-300',
                  'ml-auto px-2 py-0.5 text-[11px] font-semibold rounded-md tabular-nums shrink-0'
                ]"
              >
                {{ visibleKategoris.length }}
              </span>
            </NuxtLink>

            <NuxtLink
              v-if="hasPermission('view_any_subjek')"
              to="/dashboard/subjek"
              @click="mobileOpen = false"
              title="Subjek Arsip"
              :class="navItemClass('/dashboard/subjek')"
            >
              <span :class="isCollapsed ? 'flex items-center justify-center' : 'flex items-center gap-3 min-w-0'">
                <svg
                  :class="navIconClass('/dashboard/subjek')"
                  class="w-[18px] h-[18px] shrink-0 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
                <span v-if="!isCollapsed" class="truncate">Subjek Arsip</span>
              </span>
              <span
                v-if="!isCollapsed"
                :class="[
                  isNavActive('/dashboard/subjek') ? 'bg-sky-400/20 text-sky-200' : 'bg-white/10 text-slate-300',
                  'ml-auto px-2 py-0.5 text-[11px] font-semibold rounded-md tabular-nums shrink-0'
                ]"
              >
                {{ subjeks.length }}
              </span>
            </NuxtLink>

            <NuxtLink
              v-if="hasPermission('view_any_arsip')"
              to="/dashboard/metadata"
              @click="mobileOpen = false"
              title="Metadata"
              :class="navItemClass('/dashboard/metadata')"
            >
              <svg
                :class="navIconClass('/dashboard/metadata')"
                class="w-[18px] h-[18px] shrink-0 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25" />
              </svg>
              <span v-if="!isCollapsed" class="truncate">Metadata</span>
            </NuxtLink>

            <NuxtLink
              v-if="canRestoreArsip || canForceDeleteArsip"
              to="/dashboard/trash"
              @click="mobileOpen = false"
              title="Trash Arsip"
              :class="[
                isNavActive('/dashboard/trash')
                  ? 'bg-rose-500/20 text-rose-100 font-semibold ring-1 ring-inset ring-rose-400/35'
                  : 'text-rose-300/90 hover:bg-rose-500/10 hover:text-rose-200',
                isCollapsed ? 'flex items-center justify-center p-2.5 rounded-lg transition-all' : 'flex items-center justify-between px-3 py-2 rounded-lg transition-all'
              ]"
            >
              <span :class="isCollapsed ? 'flex items-center justify-center' : 'flex items-center gap-3 min-w-0'">
                <svg class="w-[18px] h-[18px] shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                <span v-if="!isCollapsed" class="truncate">Trash Arsip</span>
              </span>
              <span v-if="!isCollapsed && trashedArsips.length > 0" class="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-rose-500/25 text-rose-200 tabular-nums shrink-0">
                {{ trashedArsips.length }}
              </span>
            </NuxtLink>
          </div>
        </div>

        <!-- Collapsible Group: Pengaturan Sistem -->
        <div v-if="isSuperAdmin || hasPermission('view_audit_trail')">
          <button
            v-if="!isCollapsed"
            type="button"
            @click="groups.settings = !groups.settings"
            class="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span>Pengaturan Sistem</span>
            <svg
              :class="[groups.settings ? 'rotate-180' : '', 'w-3.5 h-3.5 transition-transform duration-150']"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-else class="my-2 border-t border-white/10 mx-2"></div>
          <div v-show="groups.settings || isCollapsed" :class="[!isCollapsed ? 'mt-1.5' : '', 'space-y-1']">
            <NuxtLink
              v-if="isSuperAdmin"
              to="/dashboard/users"
              @click="mobileOpen = false"
              title="Users"
              :class="navItemClass('/dashboard/users')"
            >
              <svg
                :class="navIconClass('/dashboard/users')"
                class="w-[18px] h-[18px] shrink-0 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <span v-if="!isCollapsed" class="truncate">Users</span>
            </NuxtLink>

            <NuxtLink
              v-if="isSuperAdmin"
              to="/dashboard/roles"
              @click="mobileOpen = false"
              title="Roles"
              :class="navItemClass('/dashboard/roles')"
            >
              <svg
                :class="navIconClass('/dashboard/roles')"
                class="w-[18px] h-[18px] shrink-0 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span v-if="!isCollapsed" class="truncate">Roles</span>
            </NuxtLink>

            <NuxtLink
              v-if="isSuperAdmin || hasPermission('view_audit_trail')"
              to="/dashboard/audit-trails"
              @click="mobileOpen = false"
              title="Audit Trails"
              :class="navItemClass('/dashboard/audit-trails')"
            >
              <svg
                :class="navIconClass('/dashboard/audit-trails')"
                class="w-[18px] h-[18px] shrink-0 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span v-if="!isCollapsed" class="truncate">Audit Trails</span>
            </NuxtLink>

            <NuxtLink
              v-if="isSuperAdmin"
              to="/dashboard/settings"
              @click="mobileOpen = false"
              title="Settings"
              :class="navItemClass('/dashboard/settings')"
            >
              <svg
                :class="navIconClass('/dashboard/settings')"
                class="w-[18px] h-[18px] shrink-0 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span v-if="!isCollapsed" class="truncate">Settings</span>
            </NuxtLink>
          </div>
        </div>
      </nav>

      <!-- Sidebar Footer: Account Strip -->
      <div :class="['border-t border-white/10 bg-[#081220] shrink-0', isCollapsed ? 'p-2.5' : 'p-3.5']">
        <div :class="isCollapsed ? 'flex flex-col items-center gap-2.5' : 'flex items-center justify-between gap-2.5'">
          <NuxtLink
            to="/dashboard/profile"
            @click="mobileOpen = false"
            :title="isCollapsed ? 'Profil Saya' : undefined"
            :class="['flex items-center min-w-0 group', isCollapsed ? 'justify-center' : 'gap-2.5']"
          >
            <div class="h-9 w-9 rounded-full bg-sky-500/20 ring-1 ring-sky-400/35 text-sky-200 flex items-center justify-center font-semibold text-xs shrink-0">
              {{ userInitials }}
            </div>
            <div v-if="!isCollapsed" class="min-w-0">
              <div class="text-xs font-semibold text-white group-hover:text-sky-300 truncate transition-colors">
                {{ currentUser?.name || 'Pengguna' }}
              </div>
              <div class="text-[11px] text-slate-400 truncate">
                {{ formatRoleLabel(currentUser?.role) }}
              </div>
            </div>
          </NuxtLink>
          <button
            type="button"
            @click="handleLogout"
            title="Keluar"
            aria-label="Keluar"
            class="p-2 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors shrink-0"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Column Wrapper (shifted right by sidebar width on lg+) -->
    <div
      :class="[
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64',
        'flex flex-col min-h-screen transition-all duration-200 ease-out'
      ]"
    >
      <!-- Sticky Top Header Bar -->
      <header class="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 min-w-0">
          <button
            type="button"
            @click="mobileOpen = true"
            aria-label="Buka menu navigasi"
            class="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <button
            type="button"
            @click="toggleDesktopSidebar"
            :title="sidebarCollapsed ? 'Buka Sidebar' : 'Tutup Sidebar'"
            :aria-label="sidebarCollapsed ? 'Buka sidebar' : 'Tutup sidebar'"
            class="hidden lg:inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <svg
              v-if="sidebarCollapsed"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 5.25h16.5A1.5 1.5 0 0121.75 6.75v10.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V6.75a1.5 1.5 0 011.5-1.5zM9 5.25v13.5m3.75-8.25l2.25 1.5-2.25 1.5" />
            </svg>
            <svg
              v-else
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 5.25h16.5A1.5 1.5 0 0121.75 6.75v10.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V6.75a1.5 1.5 0 011.5-1.5zM9 5.25v13.5m5.25-8.25l-2.25 1.5 2.25 1.5" />
            </svg>
          </button>

          <div class="flex items-center gap-2 text-sm min-w-0">
            <span class="hidden sm:inline text-slate-400 font-medium truncate">{{ pageInfo.section }}</span>
            <span class="hidden sm:inline text-slate-300">/</span>
            <span class="font-semibold text-slate-800 truncate">{{ pageInfo.title }}</span>
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <NuxtLink
            v-if="canCreateArsip && !route.path.startsWith('/dashboard/arsip')"
            to="/dashboard/arsip/create"
            class="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#0B192C] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Arsip Baru</span>
          </NuxtLink>

          <!-- User Dropdown -->
          <div class="relative">
            <div v-if="userMenuOpen" @click="userMenuOpen = false" class="fixed inset-0 z-40"></div>
            <button
              type="button"
              @click="userMenuOpen = !userMenuOpen"
              class="relative z-50 flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <div class="h-8 w-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-semibold text-xs shadow-sm">
                {{ userInitials }}
              </div>
              <div class="hidden md:block text-left">
                <div class="text-xs font-semibold text-slate-900 leading-tight">
                  {{ currentUser?.name || 'Pengguna' }}
                </div>
                <div class="text-[11px] text-slate-500 leading-tight">
                  {{ formatRoleLabel(currentUser?.role) }}
                </div>
              </div>
              <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div
              v-if="userMenuOpen"
              class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50"
            >
              <div class="px-4 py-2.5 border-b border-slate-100">
                <p class="text-xs font-semibold text-slate-900 truncate">{{ currentUser?.name }}</p>
                <p class="text-xs text-slate-500 truncate mt-0.5">{{ currentUser?.email }}</p>
              </div>
              <NuxtLink
                to="/dashboard/profile"
                @click="userMenuOpen = false"
                class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Profil Saya
              </NuxtLink>
              <NuxtLink
                to="/"
                @click="userMenuOpen = false"
                class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Halaman Utama
              </NuxtLink>
              <div class="my-1 border-t border-slate-100"></div>
              <button
                type="button"
                @click="handleLogout"
                class="w-full text-left px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <!-- Adaptive Page Skeleton Loader -->
        <div v-if="showSkeleton" class="space-y-6 animate-pulse" aria-busy="true" aria-label="Memuat halaman">
          <!-- Dashboard Skeleton -->
          <template v-if="skeletonVariant === 'dashboard'">
            <div class="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div class="flex items-center gap-4">
                  <div class="h-14 w-14 rounded-xl bg-slate-200/80 shrink-0"></div>
                  <div class="space-y-2">
                    <div class="h-3 w-28 rounded bg-slate-200/70"></div>
                    <div class="h-6 w-52 rounded bg-slate-200/80"></div>
                    <div class="h-3.5 w-64 max-w-full rounded bg-slate-200/60"></div>
                  </div>
                </div>
                <div class="flex gap-2.5">
                  <div class="h-9 w-28 rounded-lg bg-slate-200/70"></div>
                  <div class="h-9 w-32 rounded-lg bg-slate-200/80"></div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div v-for="i in 4" :key="`stat-${i}`" class="bg-white rounded-xl border border-slate-200/90 p-5 space-y-3 shadow-sm">
                <div class="flex items-center justify-between">
                  <div class="h-3.5 w-24 rounded bg-slate-200/80"></div>
                  <div class="h-8 w-8 rounded-lg bg-slate-200/70"></div>
                </div>
                <div class="h-7 w-16 rounded bg-slate-200/90"></div>
                <div class="h-3 w-32 rounded bg-slate-200/60"></div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div v-for="i in 2" :key="`chart-${i}`" class="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4 shadow-sm">
                <div class="flex items-center justify-between">
                  <div class="h-5 w-44 rounded bg-slate-200/80"></div>
                  <div class="h-4 w-20 rounded bg-slate-200/60"></div>
                </div>
                <div class="h-56 w-full rounded-lg bg-slate-100"></div>
              </div>
            </div>

            <div class="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4 shadow-sm">
              <div class="h-5 w-48 rounded bg-slate-200/80"></div>
              <div v-for="r in 4" :key="`dash-row-${r}`" class="flex items-center justify-between gap-4 py-2 border-t border-slate-100">
                <div class="flex items-center gap-3 flex-1">
                  <div class="h-8 w-8 rounded-lg bg-slate-200/70 shrink-0"></div>
                  <div class="space-y-1.5 flex-1 max-w-md">
                    <div class="h-4 w-3/4 rounded bg-slate-200/80"></div>
                    <div class="h-3 w-1/2 rounded bg-slate-200/60"></div>
                  </div>
                </div>
                <div class="h-6 w-20 rounded-md bg-slate-200/70 shrink-0"></div>
              </div>
            </div>
          </template>

          <!-- Form / Content Page Skeleton -->
          <template v-else-if="skeletonVariant === 'form'">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div class="space-y-2">
                <div class="h-7 w-56 rounded-lg bg-slate-200/80"></div>
                <div class="h-4 w-72 max-w-full rounded bg-slate-200/70"></div>
              </div>
              <div class="h-9 w-28 rounded-lg bg-slate-200/80"></div>
            </div>

            <div class="bg-white rounded-xl border border-slate-200/90 p-6 space-y-5 shadow-sm">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div v-for="i in 4" :key="`field-${i}`" class="space-y-2">
                  <div class="h-3.5 w-28 rounded bg-slate-200/80"></div>
                  <div class="h-10 w-full rounded-lg bg-slate-100"></div>
                </div>
              </div>
              <div class="space-y-2">
                <div class="h-3.5 w-32 rounded bg-slate-200/80"></div>
                <div class="h-28 w-full rounded-lg bg-slate-100"></div>
              </div>
              <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <div class="h-9 w-24 rounded-lg bg-slate-200/70"></div>
                <div class="h-9 w-32 rounded-lg bg-slate-200/90"></div>
              </div>
            </div>
          </template>

          <!-- Table Page Skeleton -->
          <template v-else>
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div class="space-y-2">
                <div class="flex items-center gap-2.5">
                  <div class="h-7 w-52 rounded-lg bg-slate-200/80"></div>
                  <div class="h-5 w-10 rounded-full bg-slate-200/70"></div>
                </div>
                <div class="h-4 w-80 max-w-full rounded bg-slate-200/70"></div>
              </div>
              <div class="h-9 w-32 rounded-lg bg-slate-200/80"></div>
            </div>

            <div class="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm">
              <div class="flex flex-wrap gap-3">
                <div class="h-9 w-full sm:w-80 rounded-lg bg-slate-100"></div>
                <div class="h-9 w-36 rounded-lg bg-slate-100 hidden sm:block"></div>
                <div class="h-9 w-36 rounded-lg bg-slate-100 hidden md:block"></div>
              </div>
            </div>

            <div class="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-sm">
              <div class="bg-slate-50/90 px-4 py-3.5 border-b border-slate-200 flex items-center gap-4">
                <div class="h-4 w-4 rounded bg-slate-200/80"></div>
                <div class="h-3.5 w-28 rounded bg-slate-200/80"></div>
                <div class="h-3.5 w-24 rounded bg-slate-200/70 hidden sm:block"></div>
                <div class="h-3.5 w-36 rounded bg-slate-200/70 hidden md:block"></div>
                <div class="h-3.5 w-20 rounded bg-slate-200/70 ml-auto"></div>
              </div>
              <div class="divide-y divide-slate-100">
                <div v-for="r in 6" :key="`tbl-row-${r}`" class="px-4 py-4 flex items-center gap-4">
                  <div class="h-4 w-4 rounded bg-slate-200/70 shrink-0"></div>
                  <div class="h-4 w-44 rounded bg-slate-200/80"></div>
                  <div class="h-6 w-24 rounded-md bg-slate-200/70 hidden sm:block"></div>
                  <div class="h-4 w-56 rounded bg-slate-100 hidden md:block"></div>
                  <div class="h-4 w-20 rounded bg-slate-200/70 ml-auto"></div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div v-show="!showSkeleton">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatRoleLabel } from '~/composables/useArsipApp'

const SIDEBAR_COLLAPSE_STORAGE_KEY = 'digital-arsip:sidebar-collapsed'

const route = useRoute()
const app = useArsipApp()
const {
  currentUser,
  activeArsips,
  trashedArsips,
  visibleKategoris,
  subjeks,
  settings,
  companyLogoUrl,
  isSuperAdmin,
  canCreateArsip,
  canRestoreArsip,
  canForceDeleteArsip,
  hasPermission
} = app

const groups = reactive({
  manajemen: true,
  settings: true
})
const userMenuOpen = ref(false)
const mobileOpen = ref(false)
const sidebarCollapsed = ref(false)
const isCollapsed = computed(() => sidebarCollapsed.value && !mobileOpen.value)

const pageTransitionLoading = ref(true)
let skeletonTimer: ReturnType<typeof setTimeout> | null = null

const showSkeleton = computed(
  () => pageTransitionLoading.value || !app.initialized.value || app.loading.value
)

const skeletonVariant = computed<'dashboard' | 'form' | 'table'>(() => {
  const p = route.path
  if (p === '/dashboard') return 'dashboard'
  if (
    p.includes('/create') ||
    p.includes('/edit') ||
    p === '/dashboard/settings' ||
    p === '/dashboard/profile' ||
    p === '/dashboard/picture-to-pdf' ||
    p === '/dashboard/petunjuk-penggunaan'
  ) {
    return 'form'
  }
  return 'table'
})

function triggerPageSkeleton(duration = 350) {
  pageTransitionLoading.value = true
  if (skeletonTimer) {
    clearTimeout(skeletonTimer)
  }
  skeletonTimer = setTimeout(() => {
    pageTransitionLoading.value = false
    skeletonTimer = null
  }, duration)
}

function toggleDesktopSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  if (typeof window !== 'undefined') {
    localStorage.setItem(SIDEBAR_COLLAPSE_STORAGE_KEY, sidebarCollapsed.value ? '1' : '0')
  }
}

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
    userMenuOpen.value = false
    triggerPageSkeleton(350)
  }
)

function isNavActive(path: string, exact = false): boolean {
  if (exact) return route.path === path
  return route.path === path || route.path.startsWith(`${path}/`)
}

function navItemClass(path: string, exact = false): string {
  const active = isNavActive(path, exact)
  const layout = isCollapsed.value
    ? 'flex items-center justify-center p-2.5 rounded-lg transition-all'
    : 'flex items-center gap-3 px-3 py-2 rounded-lg transition-all'
  if (active) {
    return `${layout} bg-sky-500/15 text-white font-semibold ring-1 ring-inset ring-sky-400/30 shadow-sm`
  }
  return `${layout} text-slate-300 hover:bg-white/[0.06] hover:text-white`
}

function navIconClass(path: string, exact = false): string {
  return isNavActive(path, exact) ? 'text-sky-400' : 'text-slate-400'
}

const pageInfo = computed(() => {
  const p = route.path
  if (p === '/dashboard') return { section: 'Ringkasan', title: 'Dashboard' }
  if (p === '/dashboard/arsip/create') return { section: 'Dokumen', title: 'Buat Arsip Baru' }
  if (/^\/dashboard\/arsip\/[^/]+\/edit$/.test(p)) return { section: 'Dokumen', title: 'Edit Arsip' }
  if (p.startsWith('/dashboard/arsip/')) return { section: 'Dokumen', title: 'Detail Arsip' }
  if (p === '/dashboard/arsip') return { section: 'Dokumen', title: 'Daftar Arsip' }
  if (p === '/dashboard/picture-to-pdf') return { section: 'Alat', title: 'Picture to PDF' }
  if (p === '/dashboard/petunjuk-penggunaan') return { section: 'Bantuan', title: 'Petunjuk Penggunaan' }
  if (p === '/dashboard/kategori') return { section: 'Manajemen Arsip', title: 'Fungsi Arsip' }
  if (p === '/dashboard/subjek') return { section: 'Manajemen Arsip', title: 'Subjek Arsip' }
  if (p === '/dashboard/metadata') return { section: 'Manajemen Arsip', title: 'Metadata Arsip' }
  if (p === '/dashboard/trash') return { section: 'Manajemen Arsip', title: 'Trash Arsip' }
  if (p === '/dashboard/users') return { section: 'Pengaturan Sistem', title: 'Pengguna' }
  if (p === '/dashboard/roles') return { section: 'Pengaturan Sistem', title: 'Role & Hak Akses' }
  if (p === '/dashboard/audit-trails') return { section: 'Pengaturan Sistem', title: 'Audit Trails' }
  if (p === '/dashboard/settings') return { section: 'Pengaturan Sistem', title: 'Pengaturan Instansi' }
  if (p === '/dashboard/profile') return { section: 'Akun', title: 'Profil Saya' }
  return { section: 'Dashboard', title: settings.value.name || 'Digital Arsip' }
})

onMounted(async () => {
  if (typeof window !== 'undefined') {
    sidebarCollapsed.value = localStorage.getItem(SIDEBAR_COLLAPSE_STORAGE_KEY) === '1'
  }
  await app.init()
  triggerPageSkeleton(280)
  if (!currentUser.value) {
    await navigateTo('/login')
  } else if (!app.canAccessPath(route.path)) {
    await navigateTo('/dashboard')
  }
})

onBeforeUnmount(() => {
  if (skeletonTimer) {
    clearTimeout(skeletonTimer)
    skeletonTimer = null
  }
})

const userInitials = computed(() => {
  const name = currentUser.value?.name || 'U'
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('')
})

async function handleLogout() {
  userMenuOpen.value = false
  mobileOpen.value = false
  await app.logout()
  await navigateTo('/login')
}
</script>
