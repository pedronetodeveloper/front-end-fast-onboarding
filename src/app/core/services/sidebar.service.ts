import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private sidebarStateSubject = new BehaviorSubject<{
    visible: boolean;
    hoverExpanded: boolean;
    isMobile: boolean;
  }>({
    visible: false,
    hoverExpanded: false,
    isMobile: false
  });

  public sidebarState$ = this.sidebarStateSubject.asObservable();

  updateSidebarState(state: { visible?: boolean; hoverExpanded?: boolean; isMobile?: boolean }) {
    const currentState = this.sidebarStateSubject.value;
    this.sidebarStateSubject.next({
      ...currentState,
      ...state
    });
  }

  getSidebarState() {
    return this.sidebarStateSubject.value;
  }
}
