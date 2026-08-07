import React from "react";
import {
  ProSidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  Menu,
  MenuItem,
  SubMenu,
} from "react-pro-sidebar";
import "react-pro-sidebar/dist/css/styles.css";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <>
      <ProSidebar toggled={"true"} breakPoint={"lg"}>
        <SidebarContent>
          <Menu iconShape="square">
            <MenuItem>
              <Link to="/">Dashboard</Link>
            </MenuItem>
            <SubMenu title="Components">
              <MenuItem>Component 1</MenuItem>
              <MenuItem>Component 2</MenuItem>
            </SubMenu>
          </Menu>
        </SidebarContent>
        <SidebarFooter>SpikeZone</SidebarFooter>
      </ProSidebar>
      ; ;
    </>
  );
}
