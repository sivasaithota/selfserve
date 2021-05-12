DROP FUNCTION IF EXISTS create_users_roles(TEXT);

CREATE OR REPLACE FUNCTION create_users_roles(name TEXT)

RETURNS VOID AS $$

BEGIN

  DROP TABLE IF EXISTS "user_roles";

  CREATE TABLE IF NOT EXISTS "user_roles" (
    "id" SERIAL,
    "role" TEXT,
    "function" TEXT,
    "applicable" BOOLEAN,
    "category" TEXT,
    "rolename" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "created_by" VARCHAR(255),
    "updated_by" VARCHAR(255),
    PRIMARY KEY ("id")
  );

  INSERT INTO "user_roles" (
    "role",
    "function",
    "category",
    "rolename",
    "applicable",
    "created_by",
    "updated_by"
  ) VALUES
    ('Consultant','Sc_Create','Scenario','Consultant',true,name,name),
    ('Consultant','Sc_Delete','Scenario','Consultant',true,name,name),
    ('Consultant','Sc_View','Scenario','Consultant',true,name,name),
    ('Consultant','Sc_Copy','Scenario','Consultant',true,name,name),
    ('Consultant','Sc_Edit','Scenario','Consultant',true,name,name),
    ('Consultant','Sc_Archive','Scenario','Consultant',true,name,name),
    ('Consultant','Grid_Upload','Grid','Consultant',true,name,name),
    ('Consultant','Grid_Download','Grid','Consultant',true,name,name),
    ('Consultant','Grid_View','Grid','Consultant',true,name,name),
    ('Consultant','Grid_Add','Grid','Consultant',true,name,name),
    ('Consultant','Grid_Edit','Grid','Consultant',true,name,name),
    ('Consultant','Grid_Delete','Grid','Consultant',true,name,name),
    ('Consultant','Param_View','Parameters','Consultant',true,name,name),
    ('Consultant','Param_Edit','Parameters','Consultant',true,name,name),
    ('Consultant','Exec_View','Execution','Consultant',true,name,name),
    ('Consultant','Exec_View_Setting','Execution','Consultant',true,name,name),
    ('Consultant','Exec_Run','Execution','Consultant',true,name,name),
    ('Consultant','Exec_Stop','Execution','Consultant',true,name,name),
    ('Consultant','Exec_Debug','Execution','Consultant',true,name,name),
    ('Consultant','User_Add','Users','Consultant',true,name,name),
    ('Consultant','User_View','Users','Consultant',true,name,name),
    ('Consultant','User_Edit','Users','Consultant',true,name,name),
    ('Consultant','User_Delete','Users','Consultant',true,name,name),
    ('Consultant','Set_Script','Settings','Consultant',true,name,name),
    ('Consultant','Set_Tableau','Settings','Consultant',true,name,name),
    ('Consultant','Set_Lock','Settings','Consultant',true,name,name),
    ('Consultant','Set_Slack','Settings','Consultant',true,name,name),
    ('Consultant','Set_Help','Settings','Consultant',true,name,name),
    ('Consultant','Setting','Settings','Consultant',true,name,name),
    ('Consultant','Slack_Action','Settings','Consultant',true,name,name),

    ('Analyst_ReadWrite','Sc_Create','Scenario','Analyst - Read Write',true,name,name),
    ('Analyst_ReadWrite','Sc_Delete','Scenario','Analyst - Read Write',true,name,name),
    ('Analyst_ReadWrite','Sc_View','Scenario','Analyst - Read Write',true,name,name),
    ('Analyst_ReadWrite','Sc_Copy','Scenario','Analyst - Read Write',true,name,name),
    ('Analyst_ReadWrite','Sc_Edit','Scenario','Analyst - Read Write',true,name,name),
    ('Analyst_ReadWrite','Sc_Archive','Scenario','Analyst - Read Write',true,name,name),
    ('Analyst_ReadWrite','Grid_Upload','Grid','Analyst - Read Write',true,name,name),
    ('Analyst_ReadWrite','Grid_Download','Grid','Analyst - Read Write',true,name,name),
    ('Analyst_ReadWrite','Grid_View','Grid','Analyst - Read Write',true,name,name),
    ('Analyst_ReadWrite','Grid_Add','Grid','Analyst - Read Write',true,name,name),
    ('Analyst_ReadWrite','Grid_Edit','Grid','Analyst - Read Write',true,name,name),
    ('Analyst_ReadWrite','Grid_Delete','Grid','Analyst - Read Write',true,name,name),
    ('Analyst_ReadWrite','Param_View','Parameters','Analyst - Read Write',true,name,name),
    ('Analyst_ReadWrite','Param_Edit','Parameters','Analyst - Read Write',true,name,name),
    ('Analyst_ReadWrite','Exec_View','Execution','Analyst - Read Write',true,name,name),
    ('Analyst_ReadWrite','Exec_View_Setting','Execution','Analyst - Read Write',true,name,name),
    ('Analyst_ReadWrite','Exec_Run','Execution','Analyst - Read Write',true,name,name),
    ('Analyst_ReadWrite','Exec_Stop','Execution','Analyst - Read Write',true,name,name),
    ('Analyst_ReadWrite','Exec_Debug','Execution','Analyst - Read Write',false,name,name),
    ('Analyst_ReadWrite','User_Add','Users','Analyst - Read Write',false,name,name),
    ('Analyst_ReadWrite','User_View','Users','Analyst - Read Write',false,name,name),
    ('Analyst_ReadWrite','User_Edit','Users','Analyst - Read Write',false,name,name),
    ('Analyst_ReadWrite','User_Delete','Users','Analyst - Read Write',false,name,name),
    ('Analyst_ReadWrite','Set_Script','Settings','Analyst - Read Write',false,name,name),
    ('Analyst_ReadWrite','Set_Tableau','Settings','Analyst - Read Write',false,name,name),
    ('Analyst_ReadWrite','Set_Lock','Settings','Analyst - Read Write',false,name,name),
    ('Analyst_ReadWrite','Set_Slack','Settings','Analyst - Read Write',false,name,name),
    ('Analyst_ReadWrite','Set_Help','Settings','Analyst - Read Write',false,name,name),
    ('Analyst_ReadWrite','Setting','Settings','Analyst - Read Write',false,name,name),
    ('Analyst_ReadWrite','Slack_Action','Settings','Analyst - Read Write',false,name,name),

    ('Analyst_ReadOnly','Sc_Create','Scenario','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','Sc_Delete','Scenario','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','Sc_View','Scenario','Analyst - Read Only',true,name,name),
    ('Analyst_ReadOnly','Sc_Copy','Scenario','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','Sc_Edit','Scenario','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','Sc_Archive','Scenario','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','Grid_Upload','Grid','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','Grid_Download','Grid','Analyst - Read Only',true,name,name),
    ('Analyst_ReadOnly','Grid_View','Grid','Analyst - Read Only',true,name,name),
    ('Analyst_ReadOnly','Grid_Add','Grid','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','Grid_Edit','Grid','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','Grid_Delete','Grid','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','Param_View','Parameters','Analyst - Read Only',true,name,name),
    ('Analyst_ReadOnly','Param_Edit','Parameters','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','Exec_View','Execution','Analyst - Read Only',true,name,name),
    ('Analyst_ReadOnly','Exec_View_Setting','Execution','Analyst - Read Only',true,name,name),
    ('Analyst_ReadOnly','Exec_Run','Execution','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','Exec_Stop','Execution','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','Exec_Debug','Execution','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','User_Add','Users','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','User_View','Users','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','User_Edit','Users','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','User_Delete','Users','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','Set_Script','Settings','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','Set_Tableau','Settings','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','Set_Lock','Settings','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','Set_Slack','Settings','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','Set_Help','Settings','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','Setting','Settings','Analyst - Read Only',false,name,name),
    ('Analyst_ReadOnly','Slack_Action','Settings','Analyst - Read Only',false,name,name),

    ('Analyst_ReadEdit','Sc_Create','Scenario','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','Sc_Delete','Scenario','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','Sc_View','Scenario','Analyst - Read Edit',true,name,name),
    ('Analyst_ReadEdit','Sc_Copy','Scenario','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','Sc_Edit','Scenario','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','Sc_Archive','Scenario','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','Grid_Upload','Grid','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','Grid_Download','Grid','Analyst - Read Edit',true,name,name),
    ('Analyst_ReadEdit','Grid_View','Grid','Analyst - Read Edit',true,name,name),
    ('Analyst_ReadEdit','Grid_Add','Grid','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','Grid_Edit','Grid','Analyst - Read Edit',true,name,name),
    ('Analyst_ReadEdit','Grid_Delete','Grid','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','Param_View','Parameters','Analyst - Read Edit',true,name,name),
    ('Analyst_ReadEdit','Param_Edit','Parameters','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','Exec_View','Execution','Analyst - Read Edit',true,name,name),
    ('Analyst_ReadEdit','Exec_View_Setting','Execution','Analyst - Read Edit',true,name,name),
    ('Analyst_ReadEdit','Exec_Run','Execution','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','Exec_Stop','Execution','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','Exec_Debug','Execution','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','User_Add','Users','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','User_View','Users','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','User_Edit','Users','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','User_Delete','Users','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','Set_Script','Settings','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','Set_Tableau','Settings','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','Set_Lock','Settings','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','Set_Slack','Settings','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','Set_Help','Settings','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','Setting','Settings','Analyst - Read Edit',false,name,name),
    ('Analyst_ReadEdit','Slack_Action','Settings','Analyst - Read Edit',false,name,name),

    ('BusinessUser','Sc_Create','Scenario','Business User',false,name,name),
    ('BusinessUser','Sc_Delete','Scenario','Business User',false,name,name),
    ('BusinessUser','Sc_View','Scenario','Business User',true,name,name),
    ('BusinessUser','Sc_Copy','Scenario','Business User',false,name,name),
    ('BusinessUser','Sc_Edit','Scenario','Business User',false,name,name),
    ('BusinessUser','Sc_Archive','Scenario','Business User',false,name,name),
    ('BusinessUser','Grid_Upload','Grid','Business User',false,name,name),
    ('BusinessUser','Grid_Download','Grid','Business User',false,name,name),
    ('BusinessUser','Grid_View','Grid','Business User',true,name,name),
    ('BusinessUser','Grid_Add','Grid','Business User',false,name,name),
    ('BusinessUser','Grid_Edit','Grid','Business User',false,name,name),
    ('BusinessUser','Grid_Delete','Grid','Business User',false,name,name),
    ('BusinessUser','Param_View','Parameters','Business User',false,name,name),
    ('BusinessUser','Param_Edit','Parameters','Business User',false,name,name),
    ('BusinessUser','Exec_View','Execution','Business User',true,name,name),
    ('BusinessUser','Exec_View_Setting','Execution','Business User',true,name,name),
    ('BusinessUser','Exec_Run','Execution','Business User',false,name,name),
    ('BusinessUser','Exec_Stop','Execution','Business User',false,name,name),
    ('BusinessUser','Exec_Debug','Execution','Business User',false,name,name),
    ('BusinessUser','User_Add','Users','Business User',false,name,name),
    ('BusinessUser','User_View','Users','Business User',false,name,name),
    ('BusinessUser','User_Edit','Users','Business User',false,name,name),
    ('BusinessUser','User_Delete','Users','Business User',false,name,name),
    ('BusinessUser','Set_Script','Settings','Business User',false,name,name),
    ('BusinessUser','Set_Tableau','Settings','Business User',false,name,name),
    ('BusinessUser','Set_Lock','Settings','Business User',false,name,name),
    ('BusinessUser','Set_Slack','Settings','Business User',false,name,name),
    ('BusinessUser','Set_Help','Settings','Business User',false,name,name),
    ('BusinessUser','Setting','Settings','Business User',false,name,name),
    ('BusinessUser','Slack_Action','Settings','Business User',false,name,name),

    ('Analyst_Execute','Sc_Create','Scenario','Analyst - Execute',false,name,name),
    ('Analyst_Execute','Sc_Delete','Scenario','Analyst - Execute',false,name,name),
    ('Analyst_Execute','Sc_View','Scenario','Analyst - Execute',true,name,name),
    ('Analyst_Execute','Sc_Copy','Scenario','Analyst - Execute',false,name,name),
    ('Analyst_Execute','Sc_Edit','Scenario','Analyst - Execute',false,name,name),
    ('Analyst_Execute','Sc_Archive','Scenario','Analyst - Execute',false,name,name),
    ('Analyst_Execute','Grid_Upload','Grid','Analyst - Execute',true,name,name),
    ('Analyst_Execute','Grid_Download','Grid','Analyst - Execute',true,name,name),
    ('Analyst_Execute','Grid_View','Grid','Analyst - Execute',true,name,name),
    ('Analyst_Execute','Grid_Add','Grid','Analyst - Execute',true,name,name),
    ('Analyst_Execute','Grid_Edit','Grid','Analyst - Execute',true,name,name),
    ('Analyst_Execute','Grid_Delete','Grid','Analyst - Execute',true,name,name),
    ('Analyst_Execute','Param_View','Parameters','Analyst - Execute',true,name,name),
    ('Analyst_Execute','Param_Edit','Parameters','Analyst - Execute',true,name,name),
    ('Analyst_Execute','Exec_View','Execution','Analyst - Execute',true,name,name),
    ('Analyst_Execute','Exec_View_Setting','Execution','Analyst - Execute',true,name,name),
    ('Analyst_Execute','Exec_Run','Execution','Analyst - Execute',true,name,name),
    ('Analyst_Execute','Exec_Stop','Execution','Analyst - Execute',true,name,name),
    ('Analyst_Execute','Exec_Debug','Execution','Analyst - Execute',false,name,name),
    ('Analyst_Execute','User_Add','Users','Analyst - Execute',false,name,name),
    ('Analyst_Execute','User_View','Users','Analyst - Execute',false,name,name),
    ('Analyst_Execute','User_Edit','Users','Analyst - Execute',false,name,name),
    ('Analyst_Execute','User_Delete','Users','Analyst - Execute',false,name,name),
    ('Analyst_Execute','Set_Script','Settings','Analyst - Execute',false,name,name),
    ('Analyst_Execute','Set_Tableau','Settings','Analyst - Execute',false,name,name),
    ('Analyst_Execute','Set_Lock','Settings','Analyst - Execute',false,name,name),
    ('Analyst_Execute','Set_Slack','Settings','Analyst - Execute',false,name,name),
    ('Analyst_Execute','Set_Help','Settings','Analyst - Execute',false,name,name),
    ('Analyst_Execute','Setting','Settings','Analyst - Execute',false,name,name),
    ('Analyst_Execute','Slack_Action','Settings','Analyst - Execute',false,name,name),

    ('Admin','Sc_Create','Scenario','Admin',true,name,name),
    ('Admin','Sc_Delete','Scenario','Admin',true,name,name),
    ('Admin','Sc_View','Scenario','Admin',true,name,name),
    ('Admin','Sc_Copy','Scenario','Admin',true,name,name),
    ('Admin','Sc_Edit','Scenario','Admin',true,name,name),
    ('Admin','Sc_Archive','Scenario','Admin',true,name,name),
    ('Admin','Grid_Upload','Grid','Admin',true,name,name),
    ('Admin','Grid_Download','Grid','Admin',true,name,name),
    ('Admin','Grid_View','Grid','Admin',true,name,name),
    ('Admin','Grid_Add','Grid','Admin',true,name,name),
    ('Admin','Grid_Edit','Grid','Admin',true,name,name),
    ('Admin','Grid_Delete','Grid','Admin',true,name,name),
    ('Admin','Param_View','Parameters','Admin',true,name,name),
    ('Admin','Param_Edit','Parameters','Admin',true,name,name),
    ('Admin','Exec_View','Execution','Admin',true,name,name),
    ('Admin','Exec_View_Setting','Execution','Admin',true,name,name),
    ('Admin','Exec_Run','Execution','Admin',true,name,name),
    ('Admin','Exec_Stop','Execution','Admin',true,name,name),
    ('Admin','Exec_Debug','Execution','Admin',false,name,name),
    ('Admin','User_Add','Users','Admin',true,name,name),
    ('Admin','User_View','Users','Admin',true,name,name),
    ('Admin','User_Edit','Users','Admin',true,name,name),
    ('Admin','User_Delete','Users','Admin',true,name,name),
    ('Admin','Set_Script','Settings','Admin',false,name,name),
    ('Admin','Set_Tableau','Settings','Admin',false,name,name),
    ('Admin','Set_Lock','Settings','Admin',true,name,name),
    ('Admin','Set_Slack','Settings','Admin',false,name,name),
    ('Admin','Set_Help','Settings','Admin',false,name,name),
    ('Admin','Setting','Settings','Admin',true,name,name),
    ('Admin','Slack_Action','Settings','Admin',false,name,name),

    ('Moderator','Sc_Create','Scenario','Moderator',true,name,name),
    ('Moderator','Sc_Delete','Scenario','Moderator',true,name,name),
    ('Moderator','Sc_View','Scenario','Moderator',true,name,name),
    ('Moderator','Sc_Copy','Scenario','Moderator',true,name,name),
    ('Moderator','Sc_Edit','Scenario','Moderator',true,name,name),
    ('Moderator','Sc_Archive','Scenario','Moderator',true,name,name),
    ('Moderator','Grid_Upload','Grid','Moderator',true,name,name),
    ('Moderator','Grid_Download','Grid','Moderator',true,name,name),
    ('Moderator','Grid_View','Grid','Moderator',true,name,name),
    ('Moderator','Grid_Add','Grid','Moderator',true,name,name),
    ('Moderator','Grid_Edit','Grid','Moderator',true,name,name),
    ('Moderator','Grid_Delete','Grid','Moderator',true,name,name),
    ('Moderator','Param_View','Parameters','Moderator',true,name,name),
    ('Moderator','Param_Edit','Parameters','Moderator',true,name,name),
    ('Moderator','Exec_View','Execution','Moderator',true,name,name),
    ('Moderator','Exec_View_Setting','Execution','Moderator',true,name,name),
    ('Moderator','Exec_Run','Execution','Moderator',true,name,name),
    ('Moderator','Exec_Stop','Execution','Moderator',true,name,name),
    ('Moderator','Exec_Debug','Execution','Moderator',false,name,name),
    ('Moderator','User_Add','Users','Moderator',true,name,name),
    ('Moderator','User_View','Users','Moderator',true,name,name),
    ('Moderator','User_Edit','Users','Moderator',true,name,name),
    ('Moderator','User_Delete','Users','Moderator',true,name,name),
    ('Moderator','Set_Script','Settings','Moderator',false,name,name),
    ('Moderator','Set_Tableau','Settings','Moderator',false,name,name),
    ('Moderator','Set_Lock','Settings','Moderator',true,name,name),
    ('Moderator','Set_Slack','Settings','Moderator',false,name,name),
    ('Moderator','Set_Help','Settings','Moderator',false,name,name),
    ('Moderator','Setting','Settings','Moderator',true,name,name),
    ('Moderator','Slack_Action','Settings','Moderator',false,name,name);

END;

$$  LANGUAGE plpgsql;