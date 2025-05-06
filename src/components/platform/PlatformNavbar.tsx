import React from 'react';
import { Menu, Bell, Search, LogOut, User, Settings as SettingsIcon, CheckCheck } from 'lucide-react'; // Added CheckCheck
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { useNotificationStore, selectNotifications, selectUnreadCount } from '@/lib/store/notifications'; // Import notification store
import { formatDistanceToNow } from 'date-fns'; // Import date-fns


interface PlatformNavbarProps {
  toggleSidebar: () => void;
}

export default function PlatformNavbar({ toggleSidebar }: PlatformNavbarProps) {
  const { user, signOut } = useAuth();
  const notifications = useNotificationStore(selectNotifications);
  const unreadCount = useNotificationStore(selectUnreadCount);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  // Helper to get initials from email
  const getInitials = (email?: string) => {
    if (!email) return 'A';
    const parts = email.split('@')[0].split(/[._-]/);
    return parts.map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
      <button
        type="button"
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
        onClick={toggleSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex-1 px-4 flex justify-between">
        {/* Search Bar */}
        <div className="flex-1 flex">
          <div className="w-full flex md:ml-0">
            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                className="block w-full h-full pl-10 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                placeholder="Search..."
              />
            </div>
          </div>
        </div>

        {/* Right side icons */}
        <div className="ml-4 flex items-center md:ml-6 space-x-3">

          {/* Notification Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full p-1 text-gray-400 hover:text-gray-500">
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
                {/* Unread count badge */}
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80"> {/* Increased width */}
              <DropdownMenuLabel className="flex justify-between items-center">
                <span>Notifications</span>
                {unreadCount > 0 && (
                   <span className="text-xs font-normal text-gray-500">{unreadCount} unread</span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                 <DropdownMenuItem disabled>
                   <span className="text-sm text-gray-500 px-2 py-4 text-center block w-full">No notifications yet</span>
                 </DropdownMenuItem>
              ) : (
                <div className="max-h-80 overflow-y-auto"> {/* Scrollable area */}
                  {notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`flex flex-col items-start p-2 ${!notification.read ? 'bg-blue-50' : ''}`} // Highlight unread
                      onClick={() => !notification.read && markAsRead(notification.id)} // Mark as read on click if unread
                      style={{ whiteSpace: 'normal', height: 'auto', cursor: 'pointer' }} // Allow wrapping
                    >
                      <p className={`text-sm ${!notification.read ? 'font-medium' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      <time dateTime={notification.timestamp} className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </time>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                 onClick={markAllAsRead}
                 disabled={unreadCount === 0}
                 className="flex items-center justify-center cursor-pointer"
              >
                 <CheckCheck className="h-4 w-4 mr-2" />
                 Mark all as read
              </DropdownMenuItem>
              {/* Optional: Link to a full notifications page */}
              {/* <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                 <Link to="/platform/notifications" className="flex items-center justify-center">View All</Link>
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                 <Avatar className="h-8 w-8">
                   {/* Ensure user exists before accessing metadata/email */}
                   <AvatarImage src={user?.user_metadata?.avatar_url || undefined} alt={user ? user.email : 'User'} />
                   <AvatarFallback>{user ? getInitials(user.email) : '?'}</AvatarFallback>
                 </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {/* Display name or fallback */}
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {/* Ensure user exists before accessing email */}
                    {user ? user.email : 'Loading...'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                 <Link to="/platform/account" className="flex items-center cursor-pointer">
                   <SettingsIcon className="mr-2 h-4 w-4" />
                   <span>Account Settings</span>
                 </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer flex items-center">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </div>
  );
}