<template>
  <div class="layout-container">

    <aside class="sidebar">
      <h2>MIIoT</h2>
      <nav>
		<router-link to="/login">Auth</router-link>
		<br>
        <router-link to="/dashboard">Dashboard</router-link>
		<br>
        <router-link to="/devices">Devices</router-link>
      </nav>
    </aside>

    <main class="main-content">
      <header class="topbar">User Profile / Settings</header>

      <div class="content-body">
        <router-view />
      </div>
    </main>

  </div>
</template>

<style scoped>
.layout-container { display: flex; height: 100vh; }
.sidebar { width: 250px; background: #f4f4f4; padding: 20px; }
.main-content { flex: 1; display: flex; flex-direction: column; }
.topbar { height: 60px; border-bottom: 1px solid #ddd; }
.content-body { flex: 1; padding: 20px; overflow-y: auto; }
</style>
