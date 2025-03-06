<template>
  <div>
    <div class="text-h6">
      Add Room <i v-if="selectedColor">({{ selectedColor }})</i>
    </div>
    <div class="q-gutter-sm">
      <q-btn
        v-for="color in colors"
        :key="color"
        :style="{ backgroundColor: color }"
        text-color="white"
        :icon="color === selectedColor ? 'check' : ' '"
        flat
        dense
        @click="selectedColor = color"
      />
    </div>
    <q-input v-model="newEventTitle" label="Event Title" class="q-mt-sm" />
    <q-btn label="Add" color="primary" class="q-mt-sm" @click="addEvent" />
    <q-inner-loading
      :showing="loading"
      label="Please wait..."
      label-class="text-teal"
      label-style="font-size: 1.1em"
    />
  </div>
</template>

<script>
export default {
  name: 'CCAddEvent',
  props: {
    eventCount: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      selectedColor: null,
      newEventTitle: '',
      eventForm: { id: 0, title: '', color: '' },
      colors: [
        'blue',
        'green',
        'red',
        'gray',
        'orange',
        'purple',
        'cyan',
        'pink',
        'brown',
        'teal',
        'olive',
        'indigo',
        'crimson',
        'magenta',
      ],
    }
  },
  setup() {
    const calendarApi = 'api/events'
    return { calendarApi }
  },
  //   mounted() {
  //   },
  //   watch: {
  //   },
  methods: {
    addEvent() {
      if (this.newEventTitle.trim()) {
        this.eventForm.id = this.eventCount + 1
        this.eventForm.title = this.newEventTitle
        this.eventForm.color = this.selectedColor
        this.newEventTitle = ''

        // Re-initialize the external events after adding a new one
        // We need to destroy the previous draggable instance first
        // if (this.externalEventsDraggable) {
        //   this.externalEventsDraggable.destroy()
        // }
        if (this.selectedColor) {
          this.saveEvent()
        } else {
          this.$q.notify({ type: 'info', message: 'Select event color.' })
        }
      }
    },
    async saveEvent() {
      try {
        await this.$api.post(`${this.calendarApi}/calendar/event/`, this.eventForm)
        this.showDialog = false
        this.$emit('parentMethods', this.eventForm)
        this.eventForm = { id: 0, title: '', color: '' }
        this.$q.notify({ type: 'positive', message: 'Event saved successfully' })
      } catch (error) {
        console.error('Error saving event:', error.message)
        this.$q.notify({ type: 'negative', message: 'Failed to save event' })
      }
    },
    async deleteEvent(id) {
      try {
        await this.$api.delete(`${this.calendarApi}/calendar/event/${id}/delete/`)
        this.$q.notify({ type: 'positive', message: 'Event deleted successfully' })
      } catch (error) {
        console.error('Error deleting event:', error.message)
        this.$q.notify({ type: 'negative', message: 'Failed to delete event' })
      }
    },
  },
}
</script>
