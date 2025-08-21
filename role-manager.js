 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a//dev/null b/role-manager.js
index 0000000000000000000000000000000000000000..d9a11c2d2d8848fb3b0260d4902d93b08712f971 100644
--- a//dev/null
+++ b/role-manager.js
@@ -0,0 +1,88 @@
+import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
+
+// Key used in localStorage to remember the chosen view role
+const VIEW_KEY = 'appRoleView';
+
+// DOM elements
+const bar = document.getElementById('roleBar');
+const fab = document.getElementById('roleMgrFab');
+const label = document.getElementById('roleViewLabel');
+
+let currentView = localStorage.getItem(VIEW_KEY) || 'admin';
+
+function applyRoleView(role) {
+  currentView = role;
+  localStorage.setItem(VIEW_KEY, role);
+
+  // Elements exclusive to each role
+  const ADMIN_IDS = ["adminTab", "adminPanel", "manageRolesButton"];
+  const CLIENT_IDS = ["clientPanel", "clientTab"];
+  const ROLE_SWITCH_SELECTORS = ["#viewSwitch", "#roleSwitcher", "#tabsBar", ".view-switch", ".role-switcher", ".view-selector", "#chooseView", "#viewChooser"];
+
+  // Toggle visibility based on role
+  ADMIN_IDS.forEach(id => {
+    const el = document.getElementById(id);
+    if (el) el.classList.toggle('hidden', role !== 'admin');
+  });
+  CLIENT_IDS.forEach(id => {
+    const el = document.getElementById(id);
+    if (el) el.classList.toggle('hidden', role !== 'client');
+  });
+  ROLE_SWITCH_SELECTORS.forEach(sel => {
+    document.querySelectorAll(sel).forEach(el => el.classList.toggle('hidden', role !== 'admin'));
+  });
+
+  document.querySelectorAll('[data-admin-only]').forEach(el => el.classList.toggle('hidden', role !== 'admin'));
+  document.querySelectorAll('[data-client-only]').forEach(el => el.classList.toggle('hidden', role !== 'client'));
+
+  document.body.classList.toggle('is-admin', role === 'admin');
+  document.body.classList.toggle('is-client', role === 'client');
+
+  if (label) label.textContent = role === 'admin' ? 'Admin View' : 'Client View';
+  if (fab) {
+    // keep icon but change text
+    const icon = '<i class="bi bi-wrench-adjustable"></i>';
+    fab.innerHTML = role === 'admin' ? `${icon} Switch to Client` : `${icon} Switch to Admin`;
+  }
+}
+
+function toggleRole() {
+  const next = currentView === 'admin' ? 'client' : 'admin';
+  applyRoleView(next);
+}
+
+function initRoleManager() {
+  if (fab) fab.addEventListener('click', toggleRole);
+
+  const auth = getAuth();
+  onAuthStateChanged(auth, async user => {
+    if (!bar || !fab) return;
+    if (!user) {
+      bar.classList.add('hidden');
+      fab.classList.add('hidden');
+      return;
+    }
+    try {
+      const tok = await user.getIdTokenResult(true);
+      const isAdmin = tok?.claims?.role === 'admin';
+      bar.classList.toggle('hidden', !isAdmin);
+      fab.classList.toggle('hidden', !isAdmin);
+      if (isAdmin) {
+        applyRoleView(currentView);
+      } else {
+        applyRoleView('client');
+      }
+    } catch (e) {
+      bar.classList.add('hidden');
+      fab.classList.add('hidden');
+    }
+  });
+}
+
+// Initialize immediately
+initRoleManager();
+
+// Exported for inline handlers
+export { toggleRole, applyRoleView };
+window.toggleRole = toggleRole;
+window.applyRoleView = applyRoleView;
 
EOF
)
