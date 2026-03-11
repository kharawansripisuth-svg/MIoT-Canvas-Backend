<script setup>
import AppSidebar from '@/components/AppSidebar.vue'
</script>

<template>
	<div class="layout-root">

		<!-- Sidebar Component (fixed overlay) -->
		<AppSidebar />

		<!-- Main Content (never shifts) -->
		<main class="layout-main">
			<header class="layout-header">
				<h1 class="breadcrumb">
					Home / <span class="breadcrumb-active">{{ $route.name }}</span>
				</h1>
			</header>

			<div class="layout-content">
				<router-view></router-view>
			</div>
		</main>

	</div>
</template>
