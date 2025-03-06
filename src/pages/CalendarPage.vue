<template>
  <q-page class="q-pa-md row">
    <!-- Sidebar -->
    <div class="col-3">
      <!-- Draggable Events -->
      <q-card class="q-mb-md">
        <q-card-section>
          <!-- Component Calendar Event -->
          <CCEvents
            :events="events"
            @showLoading="showLoading"
            @deleteEvents="deleteEvents"
          ></CCEvents>
          <!-- :parentDeleteMethod=""
          :parentDeleteMethod="" -->
        </q-card-section>
      </q-card>

      <!-- Create Event -->
      <q-card>
        <q-card-section>
          <!-- Component Add Event -->
          <CCAddEvent :eventCount="events.length" @parentMethods="addNewEvent"></CCAddEvent>
        </q-card-section>
      </q-card>
    </div>

    <!-- Calendar -->
    <div class="col-9">
      <q-card>
        <q-card-section>
          <FullCalendar ref="calendarRef" :options="calendarOptions" />
        </q-card-section>
      </q-card>
    </div>

    <!-- Diaglog Update/Create Event -->
    <q-dialog v-model="showUCEvent">
      <q-card>
        <q-card-section>
          <div class="text-h6">Meeting / Event</div>
        </q-card-section>

        <q-separator />

        <q-card-section style="max-height: 50vh" class="scroll">
          <q-form @submit.prevent class="q-gutter-md">
            <!-- Title -->
            <q-input v-model="nEventform.title" label="Title" outlined required />

            <!-- Description -->
            <q-input
              v-model="nEventform.description"
              label="Description"
              type="textarea"
              outlined
              required
            />

            <!-- Start Date & Time -->
            <div class="row q-gutter-sm" style="max-width: 100%">
              <!-- Date Picker -->
              <q-input
                filled
                v-model="nEventform.startDate"
                mask="date"
                :rules="['date']"
                label="Select Start Date"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="nEventform.startDate">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>

              <!-- Time Picker -->
              <q-input filled v-model="nEventform.startTime" mask="time" label="Select Start Time">
                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-time v-model="nEventform.startTime" format24h>
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <!-- End Date & Time -->
            <div class="row q-gutter-sm" style="max-width: 100%">
              <!-- Date Picker -->
              <q-input
                filled
                v-model="nEventform.endDate"
                mask="date"
                :rules="['date']"
                label="Select End Date"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="nEventform.endDate">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>

              <!-- Time Picker -->
              <q-input filled v-model="nEventform.endTime" mask="time" label="Select End Time">
                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-time v-model="nEventform.endTime" format24h>
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
          <q-btn
            flat
            label="Save"
            v-if="saveAllowed ? true : false"
            type="submit"
            color="primary"
            @click="saveNewEvent"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import CCAddEvent from 'src/components/Calendar/CCAddEvent.vue'

import { QSpinnerHourglass } from 'quasar'
import CCEvents from 'src/components/Calendar/CCEvents.vue'

export default {
  components: {
    FullCalendar,
    CCAddEvent,
    CCEvents,
  },
  data() {
    return {
      events: [],
      selectedColor: '',
      externalEventsDraggable: null,
      calendarOptions: {
        plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        },
        editable: true,
        droppable: true,
        dayMaxEvents: 3,
        eventResizableFromStart: true,
        eventReceive: this.handleEventReceive,
        eventDrop: this.handleEventDrop,
        eventResize: this.handleEventResize,
        events: [],
        datesSet: (info) => {
          this.dateRange.start = this.$formatDate(info.startStr)
          this.dateRange.end = this.$formatDate(info.endStr)

          // Fetching...
          this.fetchEvents()
        },
        timeZone: 'Asia/Manila', // Use the browser's local timezone
      },
      dateRange: { start: null, end: null },
      showUCEvent: false,
      nEventform: {
        title: '',
        description: '',
        startDate: '',
        startTime: '00:00',
        endDate: '',
        endTime: '00:00',
        location: '',
        color: '',
        start: '',
        end: '',
      },
      saveAllowed: false,
    }
  },
  watch: {
    nEventform: {
      handler() {
        if (this.nEventform.startDate && this.nEventform.endDate) {
          const startDateTime = new Date(
            `${this.nEventform.startDate} ${this.nEventform.startTime}`,
          )
          const endDateTime = new Date(`${this.nEventform.endDate} ${this.nEventform.endTime}`)
          if (startDateTime > endDateTime) {
            this.saveAllowed = false
          } else {
            this.saveAllowed = true
          }
        }
        // this.loading = true
        // setTimeout(() => {
        //   this.rows = this.events
        //   this.loading = false
        // }, 500)
      },
      deep: true,
    },
  },
  methods: {
    showLoading(eventtype = true) {
      if (eventtype) {
        this.$q.loading.show({
          spinner: QSpinnerHourglass,
          spinnerSize: 50,
          message: 'Please wait...',
          messageColor: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          spinnerColor: 'white',
        })
      } else {
        this.$q.loading.hide()
      }
    },

    deleteEvents(evetnItem) {
      this.events = this.events.filter((e) => e.id !== evetnItem)
    },

    async getEventType() {
      this.showLoading()
      try {
        // Mock API call for now
        console.log('Fetching event types...')
        // Uncomment when your API is ready
        const response = await this.$api.get('api/events/calendar/event/')
        this.events = response.data
      } catch (error) {
        console.error('Error fetching event types:', error)
      }

      setTimeout(() => {
        this.showLoading(false)
      }, 3000)
    },

    addNewEvent(eventformvalue = {}) {
      if (eventformvalue.id >= 1) {
        this.events.push(eventformvalue)
        if (this.events.length === 1) {
          this.getEventType()
        }
      }
    },

    async fetchEvents() {
      this.showLoading()
      try {
        // Mock API call for now
        console.log('Fetching events...')
        // Uncomment when your API is ready
        const response = await this.$api.get('api/events/calendar/', { params: this.dateRange })
        this.calendarOptions.events = response.data
      } catch (error) {
        console.error('Error fetching events:', error)
      }

      setTimeout(() => {
        this.showLoading(false)
      }, 3000)
    },

    endDateStr(info) {
      const adjustedEnd = info ? new Date(info) : null
      if (adjustedEnd) {
        adjustedEnd.setDate(adjustedEnd.getDate() - 1) // Subtract 1 day
      }
      return adjustedEnd ? adjustedEnd.toISOString() : null
    },

    handleEventDrop(info) {
      try {
        // console.log(
        //   'Event dropped:',
        //   info.event.title,
        //   'Date:',
        //   `${info.event.startStr} - ${this.endDateStr(info.event.endStr)}`,
        // )
        this.updateEvent(info)
      } catch (error) {
        console.error('Error updating event:', error)
        info.revert()
      }
    },

    handleEventResize(info) {
      // console.log('Event resized:', info.event.title, info.event.start, info.event.end)
      this.nEventform.location = info.event.title
      this.nEventform.startDate = this.$formatDate(info.event.start)
      this.nEventform.endDate = this.$formatDateTime(this.endDateStr(info.event.end)) || null
      this.nEventform.color = info.event.backgroundColor
      this.updateEvent(info.event.id)
    },

    handleEventReceive(info) {
      this.showUCEvent = true
      // console.log('Event received:', info.event.title, 'Date:', info.event.startStr)
      this.nEventform.location = info.event.title
      this.nEventform.startDate = this.$formatDate(info.event.start)
      this.nEventform.endDate = this.$formatDateTime(this.endDateStr(info.event.end)) || null
      this.nEventform.color = info.event.backgroundColor
    },

    async saveNewEvent() {
      try {
        const forms = {
          title: this.nEventform.title,
          description: this.nEventform.description,
          location: this.nEventform.location,
          color: this.nEventform.color,
          start: this.$formatDateTime(`${this.nEventform.startDate} ${this.nEventform.startTime}`),
          end: this.$formatDateTime(`${this.nEventform.endDate} ${this.nEventform.endTime}`),
        }
        console.log('Saving event:', forms)
        const response = await this.$api.post('api/events/calendar/', forms)
        console.log('Event saved:', response.data)
      } catch (error) {
        console.error('Error saving event:', error)
      }
    },

    async updateEvent(info) {
      try {
        const forms = {
          title: info.event.title,
          start: this.$formatDateTime(info.event.start),
          end: this.$formatDateTime(info.event.end),
        }
        console.log('Update event:', forms)
        const response = await this.$api.put(`api/events/calendar/${info.event.id}/`, forms)
        console.log('Event saved:', response.data)
      } catch (error) {
        console.error('Error updating event:', error)
      }
    },

    async deleteEvent(id) {
      try {
        console.log('Delete event:', this.nEventform)
        const response = await this.$api.delete(
          `api/events/calendar/${id}/delete/`,
          this.nEventform,
        )
        console.log('Event saved:', response.data)
      } catch (error) {
        console.error('Error deleting event:', error)
      }
    },

    initExternalEvents() {
      setTimeout(() => {
        const container = document.getElementById('external-events')
        if (container) {
          this.externalEventsDraggable = new Draggable(container, {
            itemSelector: '.fc-event',
            eventData: function (eventEl) {
              return {
                title: eventEl.textContent.trim(),
                backgroundColor: eventEl.style.backgroundColor,
                borderColor: eventEl.style.backgroundColor,
              }
            },
          })
          console.log('External events initialized')
        }
      }, 1000)
    },
  },
  mounted() {
    // Initialize external draggable events
    this.initExternalEvents()

    // Fetch event types
    this.getEventType()

    // Fetch events
    this.fetchEvents()
  },
}
</script>
