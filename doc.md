# VenU Platform Release - Release Notes & Changelog

This repository contains the latest updates, features, and enhancements for the VenU Event and Venue Management platform. Below is a high-level summary of the system patches and feature integrations included in this release.

---

## Key Feature Integrations

### 1. Enhanced Venue Compliance & Documentation
*   **Added Strict Verification Controls**: Standalone Venue Registration and Custom Event Venue forms now collect and validate vital municipal/compliance documents including Fire Safety Inspection Certificates (FSIC) and Mayor's/Business Permits.
*   **Safety Declarations**: Organizers are prompted to declare key safety standards (presence of smoke detectors, fire exits, and BIR forms) during the logistics stage.
*   **Required Asset Uploads**: Supports attaching venue floor plans/blueprints and legal packages as part of the approval process.

### 2. Admin User Verification Dashboard
*   **Verification Status badges**: Refactored the Admin User Management panel to display real-time verification indicators ("Verified" or "Pending ID") for attendees and organizers.
*   **Streamlined Approvals Flow**: Improved the backend state synchronization between the Identity Approvals modal and the master User Management directory.

### 3. Precision Geolocation & Bounding Box Checks
*   **Coordinate-Based Mapping**: Integrated latitude and longitude input support on all physical venue forms.
*   **Coordinates Validation**: Implemented localized validation to ensure geographic coordinates fall correctly within the administrative boundaries of the region. This flags input errors, such as accidentally swapped coordinates.
*   **Updated Seed Locations**: Enriched pre-configured platform venues (SMX pasay, bulacan arena, etc.) with accurate geocoordinates.

### 4. Direct QR Code Rendering
*   **Interactive Payment Gateways**: The attendee checkout flow supports scan-to-pay functionality by rendering high-resolution, secure payment QR codes in the ticketing interface.
*   **Digital Gate Passes**: Generates unique, scannable QR ticket codes upon successful checkout to facilitate quick check-ins at physical events.
