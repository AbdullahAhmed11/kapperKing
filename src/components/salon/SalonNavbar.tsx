import React, { useEffect } from 'react'; // Import useEffect
import { Menu, Bell, Search, LogOut, Settings, CheckCircle } from 'lucide-react'; // Added CheckCircle
import { useCurrentSalonStore } from '@/lib/store/currentSalon';
import { useAuth } from '@/lib/auth';
import { useNotificationStore } from '@/lib/store/notifications'; // Import notification store
import { Link } from 'react-router-dom'; // Import Link
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import Dropdown components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // Import Badge
import { formatDistanceToNow } from 'date-fns'; // For relative time
export default function SalonNavbar() {
  const { currentSalon } = useCurrentSalonStore();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore(); // Get notification state/actions

  // Fetch notifications when user and salon are available
  useEffect(() => {
    if (user?.id && currentSalon?.id) {
      fetchNotifications(user.id, currentSalon.id);
      // TODO: Set up Supabase Realtime listener for new notifications
    }
  }, [user?.id, currentSalon?.id, fetchNotifications]);

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
      <button
        type="button"
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" />
      </button>
      
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex">
          <div className="w-full flex md:ml-0">
            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                placeholder="Search"
              />
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6 space-x-3"> {/* Added space-x-3 */}
          {/* Notification Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full">
                 <Bell className="h-6 w-6" />
                 {unreadCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0 text-xs">
                       {unreadCount}
                    </Badge>
                 )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
               <DropdownMenuLabel className="flex justify-between items-center">
                  <span>Notifications</span>
                  {unreadCount > 0 && <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => user && currentSalon && markAllAsRead(user.id, currentSalon.id)}>Mark all read</Button>}
               </DropdownMenuLabel>
               <DropdownMenuSeparator />
               {notifications.length === 0 ? (
                  <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
               ) : (
                  notifications.slice(0, 5).map(notification => ( // Show latest 5
                     <DropdownMenuItem
                        key={notification.id}
                        className={`flex items-start gap-2 ${!notification.is_read ? 'font-semibold' : ''}`}
                        onSelect={() => !notification.is_read && markAsRead(notification.id)} // Mark as read on select
                     >
                        {/* TODO: Add icons based on notification.type */}
                        <div className="flex-1 space-y-1">
                           <p className="text-sm leading-tight">{notification.title}</p>
                           <p className="text-xs text-muted-foreground">{notification.message}</p>
                           <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                           </p>
                        </div>
                        {!notification.is_read && <div className="h-2 w-2 rounded-full bg-primary mt-1"></div>}
                     </DropdownMenuItem>
                  ))
               )}
                {/* TODO: Add link to view all notifications page */}
               {notifications.length > 5 && (
                  <>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem asChild>
                        <Link to="/salon/notifications" className="justify-center">View All</Link>
                     </DropdownMenuItem>
                  </>
               )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {/* TODO: Add user avatar image if available */}
                    {/* <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} /> */}
                    <AvatarFallback>
                       {/* Use user email initial if available, fallback to S */}
                       {user?.email?.charAt(0).toUpperCase() || 'S'}
                    </AvatarFallback>
                  </Avatar>
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.email}</p>
                  {/* Display user's role or salon name if available */}
                  <p className="text-xs leading-none text-muted-foreground">
                     {currentSalon?.name || 'Salon Staff'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                 <Link to="/salon/settings"> {/* Link to settings */}
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                 </Link>
              </DropdownMenuItem>
              {/* Add other links if needed */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}