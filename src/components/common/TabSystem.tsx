import { ReactNode, useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};

type TabSystemProps = {
  tabs: TabItem[];
  defaultValue?: string;
  onTabChange?: (value: string) => void;
  persistKey?: string; // Optional key to persist selected tab in localStorage
  className?: string;
  tabsListClassName?: string;
  tabContentClassName?: string;
};

/**
 * A standardized tab system component used throughout the application
 * Supports icons, persistence, and custom styling
 */
export const TabSystem = ({
  tabs,
  defaultValue,
  onTabChange,
  persistKey,
  className = '',
  tabsListClassName = '',
  tabContentClassName = ''
}: TabSystemProps) => {
  // Initialize with default or first tab
  const initialTab = defaultValue || tabs[0]?.id;
  
  // Set up state for active tab
  const [activeTab, setActiveTab] = useState<string>(
    // Try to load from localStorage if persistKey is provided
    persistKey 
      ? localStorage.getItem(`tabSystem_${persistKey}`) || initialTab
      : initialTab
  );

  // Save to localStorage when tab changes if persistKey is provided
  useEffect(() => {
    if (persistKey && activeTab) {
      localStorage.setItem(`tabSystem_${persistKey}`, activeTab);
    }
  }, [activeTab, persistKey]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (onTabChange) {
      onTabChange(value);
    }
  };

  // Validate if the active tab exists in the tabs array
  useEffect(() => {
    const tabExists = tabs.some(tab => tab.id === activeTab);
    if (!tabExists && tabs.length > 0) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className={className}
    >
      <TabsList className={`w-full ${tabsListClassName}`}>
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={tab.disabled}
            className="flex items-center gap-2"
          >
            {tab.icon && <span className="text-base">{tab.icon}</span>}
            <span>{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(tab => (
        <TabsContent 
          key={tab.id} 
          value={tab.id}
          className={tabContentClassName}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};