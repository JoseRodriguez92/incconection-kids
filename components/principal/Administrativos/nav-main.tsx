"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: NavItem[]
  onClick?: (onNavigate: (view: string) => void) => void
}

interface NavMainProps {
  items: NavItem[]
  onNavigate: (view: string) => void
}

export function NavMain({ items, onNavigate }: NavMainProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navegación</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a
                  href={item.url}
                  onClick={(e) => {
                    e.preventDefault()
                    if (item.onClick) {
                      item.onClick(onNavigate)
                    }
                  }}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          {subItem.items?.length ? (
                            <Collapsible asChild>
                              <div>
                                <CollapsibleTrigger asChild>
                                  <SidebarMenuSubButton asChild>
                                    <a href={subItem.url}>
                                      <span>{subItem.title}</span>
                                      <ChevronRight className="ml-auto h-4 w-4" />
                                    </a>
                                  </SidebarMenuSubButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <SidebarMenuSub>
                                    {subItem.items.map((nestedItem) => (
                                      <SidebarMenuSubItem key={nestedItem.title}>
                                        <SidebarMenuSubButton asChild>
                                          <a
                                            href={nestedItem.url}
                                            onClick={(e) => {
                                              e.preventDefault()
                                              if (nestedItem.onClick) {
                                                nestedItem.onClick(onNavigate)
                                              }
                                            }}
                                          >
                                            <span>{nestedItem.title}</span>
                                          </a>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    ))}
                                  </SidebarMenuSub>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          ) : (
                            <SidebarMenuSubButton asChild>
                              <a
                                href={subItem.url}
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (subItem.onClick) {
                                    subItem.onClick(onNavigate)
                                  }
                                }}
                              >
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          )}
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
