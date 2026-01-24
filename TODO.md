# Integration Plan: Events, Routines, and Planning System

## Overview
Integrate events and routines into a single planning system, and merge "mon Planning" with the calendar into one unified interface.

## Completed Tasks
- [x] Create EventsRoutinesScreen.js - Unified screen for events and routines management
- [x] Create PlanningCalendarScreen.js - Integrated planning and calendar view
- [x] Update WelcomeScreen.js - Add navigation buttons for new screens
- [x] Update Sidebar.js - Add menu items for new screens

## Pending Tasks
- [ ] Update routing configuration to include new screens
- [ ] Test navigation between screens
- [ ] Verify data flow between contexts
- [ ] Update any remaining references to old screens

## Key Features Implemented
1. **EventsRoutinesScreen**: Combines event creation (formations, congrès, soutenances) with routine management (work, health, study categories)
2. **PlanningCalendarScreen**: Merges admin planning with calendar view, shows events when clicking dates
3. **Updated Navigation**: Home screen and sidebar now include access to integrated screens

## Testing Checklist
- [ ] Navigate to EventsRoutinesScreen from home/sidebar
- [ ] Create events and routines successfully
- [ ] Navigate to PlanningCalendarScreen
- [ ] View planning events in calendar
- [ ] Click dates to see all events for that day
- [ ] Admin can add medical events (congrès, formations)
- [ ] Data persists correctly across app restarts

## Notes
- Events are stored locally in EventsRoutinesScreen state
- Routines use RoutineContext for persistence
- Planning uses PlanningContext with server sync
- Medical events are stored locally in PlanningCalendarScreen
