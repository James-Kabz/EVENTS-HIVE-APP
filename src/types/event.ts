// src/types/event.ts

/**
 * Main Event interface defining the structure of event objects
 */
export interface Event {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    imageUrl: string;
    isPublished: boolean;
    category: string;
    capacity: number;
    creator: {
      id: string;
      name: string; // Required (not optional)
      email: string;
    };
    ticketTypes: TicketType[];
    _count?: {
      attendees?: number;
      ticketTypes?: number;
    };
  }
  
  /**
   * Type for ticket information
   */
  export interface TicketType {
    id: string;
    name: string;
    price: number;
    quantity: number;
    description?: string;
    eventId: string;
    availableUntil?: string;
    salesStartDate?: string;
  }
  
  /**
   * Type for event creation form data
   */
  export interface EventFormData {
    title: string;
    description: string;
    startDate: string | Date;
    endDate: string | Date;
    location: string;
    imageUrl?: string;
    isPublished: boolean;
    category: string;
    capacity: number;
    ticketTypes?: TicketTypeFormData[];
  }
  
  /**
   * Type for ticket type form data
   */
  export interface TicketTypeFormData {
    id?: string;
    name: string;
    price: number;
    quantity: number;
    description?: string;
    availableUntil?: string | Date;
    salesStartDate?: string | Date;
  }
  
  /**
   * Type for event filtering options
   */
  export interface EventFilters {
    category?: string;
    startDate?: string | Date;
    endDate?: string | Date;
    priceRange?: {
      min: number;
      max: number;
    };
    searchTerm?: string;
  }
  
  /**
   * Type for API responses containing events
   */
  export interface EventsApiResponse {
    events: Event[];
    totalCount: number;
    page: number;
    pageSize: number;
  }
  
  /**
   * Type for a single event API response
   */
  export interface EventApiResponse {
    event: Event;
  }
  
  /**
   * Props for EventsList component
   */
  export interface EventsListProps {
    events: Event[];
    isLoading: boolean;
    emptyMessage: string;
    showManageActions?: boolean;
    onEventUpdated: () => Promise<void>;
  }
  
  /**
   * Props for EventFormModal component
   */
  export interface EventFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    eventId?: string;
    initialData?: Partial<EventFormData>;
  }