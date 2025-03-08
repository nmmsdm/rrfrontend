<template>
  <div>
    <div class="text-h6">Event Rooms</div>
    <div id="external-events">
      <div
        v-for="event in rows"
        :key="event.id"
        class="fc-event external-event draggable-event cursor-pointer"
        :style="{ backgroundColor: event.color }"
        @dblclick="handleDoubleClick(event.id)"
      >
        <q-card class="bg-transparent text-white full-width" flat borderless>
          <div class="row items-center no-wrap justify-between full-width">
            <span class="ellipsis" v-bind:title="event.title">{{ event.title }}</span>
          </div>
        </q-card>
      </div>
      <q-inner-loading :showing="loading" label-class="text-teal" label-style="font-size: 1.1em" />
    </div>

    <!-- showDiaglog Confirmation -->
    <q-dialog v-model="showDialog">
      <q-card style="width: 500px; max-width: 90vw; height: 300px">
        <q-card-section class="row justify-between items-center">
          <div class="text-h6">Edit or Remove</div>
          <q-btn flat dense icon="close" color="grey" v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-input v-model="eventForm.title" label="Edit Text" filled />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Remove" color="red" @click="deleteEvent(eventForm)" />
          <q-btn flat label="Save" color="green" @click="updateEvent(eventForm)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
export default {
  name: 'CCEvents',
  props: {
    events: {
      type: Object,
      required: true,
    },
    // parentDeleteMethod: Function,
  },
  data() {
    return {
      loading: false,
      showDialog: false,
      eventForm: { id: 0, title: '', color: '' },
      rows: [],
    }
  },
  setup() {
    const calendarApi = 'api/events'
    return { calendarApi }
  },
  mounted() {
    this.rows = this.events
  },
  watch: {
    events: {
      handler() {
        this.loading = true
        setTimeout(() => {
          this.rows = this.events
          this.loading = false
        }, 500)
      },
      deep: true,
    },
  },
  methods: {
    updateEvent(uevent) {
      const event = this.rows.find((e) => e.id === uevent.id)
      this.$q
        .dialog({
          title: `Are you sure you want to update ${event.title} to ${uevent.title}?`,
          message: 'This action is only editable once submitted.',
          ok: {
            label: 'Yes, update it',
            color: 'negative',
          },
          cancel: {
            label: 'No, keep it',
          },
          persistent: true,
        })
        .onOk(async () => {
          this.$emit('showLoading')
          try {
            if (event.title !== this.eventForm.title) {
              await this.$api.put(
                `${this.calendarApi}/calendar/event/${uevent.id}/`,
                this.eventForm,
              )
              event.title = this.eventForm.title
              this.$q.notify({ type: 'positive', message: 'Event updated successfully' })
            }
            this.showDialog = false
            this.eventForm = { id: 0, title: '', color: '' }
          } catch (error) {
            console.error('Error saving event:', error.message)
            this.$q.notify({ type: 'negative', message: 'Failed to update event' })
          }
          this.$emit('showLoading', false)
        })
    },

    deleteEvent(event) {
      this.$q
        .dialog({
          title: `Are you sure you want to delete ${event.title}?`,
          message: 'This action cannot be undone.',
          ok: {
            label: 'Yes, delete it',
            color: 'negative',
          },
          cancel: {
            label: 'No, keep it',
          },
          persistent: true,
        })
        .onOk(() => {
          this.deleteItem(event.id)
        })
    },
    async deleteItem(id) {
      this.$emit('showLoading')
      try {
        await this.$api.delete(`${this.calendarApi}/calendar/event/${id}/delete/`)
        this.$emit('deleteEvents', id)
        this.showDialog = false
        this.$q.notify({ type: 'positive', message: 'Event deleted successfully' })
      } catch (error) {
        console.error('Error deleting event:', error.message)
        this.$q.notify({ type: 'negative', message: 'Failed to delete event' })
      }
      this.$emit('showLoading', false)
    },

    handleDoubleClick(eventID) {
      const event = this.rows.find((e) => e.id === eventID)
      this.eventForm.id = event.id
      this.eventForm.title = event.title
      this.eventForm.color = event.color
      this.showDialog = true
    },
  },
}
</script>

<style scoped>
.draggable-event {
  padding: 8px;
  border-radius: 4px;
  cursor: grab;
  margin-bottom: 8px;
  user-select: none;
}

#external-events {
  min-height: 100px;
}

#external-events .fc-event {
  margin: 0.5em 0;
  cursor: move;
}
</style>
