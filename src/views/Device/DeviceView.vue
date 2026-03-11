<script setup>
import AppIcon from '@/components/AppIcon.vue'
</script>

<template>
	<section class="flex-col">

		<header class="my-5 px-3 h-8 flex">

			<div class="flex-auto">
				<div class="flex flex-row items-baseline gap-2.5">
					<div class="text-2xl font-sans font-semibold text-text-primary bottom-0">Device</div>
					<div class="text-xs font-sans font-normal text-text-tertiary bottom-0">Manage and monitor all connected IoT devices</div>
				</div>
			</div>


			<div class="flex-auto inline-flex justify-end items-center gap-2.5">

				<button class="h-9 gap-2 p-2 inline-flex bg-white rounded-md outline outline-offset-1 outline-border-light justify-between items-center">
					<AppIcon name="magnifying-glass" size="16" color="#8C8C8C" />
					<div class="text-text-tertiary text-[10px] font-light font-sans leading-3">Search devices by name, ID, or tag...</div>
				</button>
				<button class="h-9 gap-2 p-2 inline-flex bg-white rounded-md outline outline-offset-1 outline-border-light justify-between items-center">
					<AppIcon name="funnel" size="16" color="#8C8C8C" />
					<div class=" text-text-tertiary text-[10px] font-light font-sans leading-3">Status: All</div>
					<AppIcon name="chevron-down" size="12" color="#8C8C8C" />
				</button>
				<button class="h-9 gap-1 p-2 inline-flex bg-primary hover:bg-primary-hover rounded-md  justify-between items-center">
					<AppIcon name="plus" size="14" color="white" />
					<div class="text-white text-[14px] font-light font-sans">Add Device</div>
				</button>

			</div>

		</header>

	</section>
</template>
