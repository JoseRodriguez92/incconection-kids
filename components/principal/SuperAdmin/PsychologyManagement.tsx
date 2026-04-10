"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  FileText,
  Shield,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { usePsychologyState } from "./components/psychology/usePsychologyState";
import { CaseFormDialog } from "./components/psychology/CaseFormDialog";
import { CasesTab } from "./components/psychology/CasesTab";
import { CaseTypesTab } from "./components/psychology/CaseTypesTab";
import { RiskLevelsTab } from "./components/psychology/RiskLevelsTab";
import { CaseDetailsDialog } from "./components/psychology/CaseDetailsDialog";
import { SessionDialog } from "./components/psychology/SessionDialog";
import { FollowupDialog } from "./components/psychology/FollowupDialog";
import { MeetingDialog } from "./components/psychology/MeetingDialog";
import {
  FileUploadDialog,
  FilePreviewDialog,
} from "./components/psychology/FileDialogs";

export default function PsychologyManagement() {
  const s = usePsychologyState();

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between relative z-1">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Brain className="w-7 h-7 text-purple-600" />
          Gestión de Psicología
        </h2>
        <Button
          className="flex items-center space-x-2"
          disabled={!s.instituteId}
          onClick={() => s.setIsCreateDialogOpen(true)}
        >
          {!s.instituteId ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Nuevo Caso</span>
            </>
          )}
        </Button>
      </div>

      {/* ── Métricas ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          {
            value: s.casesLoading ? null : s.cases.length,
            label: "Total Casos",
            color: "blue",
            Icon: FileText,
          },
          {
            value: s.alertsLoading ? null : s.alerts.length,
            label: "Alertas Activas",
            color: "orange",
            Icon: AlertCircle,
          },
          {
            value: s.casesLoading
              ? null
              : s.cases.filter((c) => c.status?.toLowerCase() === "cerrado")
                  .length,
            label: "Casos Cerrados",
            color: "green",
            Icon: CheckCircle,
          },
        ].map(({ value, label, color, Icon }) => (
          <Card key={label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-3xl font-bold text-${color}-600`}>
                    {value === null ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      value
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </div>
                <div className={`p-3 bg-${color}-100 rounded-full`}>
                  <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Tabs principales ── */}
      <Tabs defaultValue="cases" className="w-full relative z-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cases">
            <FileText className="w-4 h-4 mr-2" />
            Casos Psicológicos
          </TabsTrigger>
          <TabsTrigger value="types">
            <Brain className="w-4 h-4 mr-2" />
            Tipos de Casos
          </TabsTrigger>
          <TabsTrigger value="risk">
            <Shield className="w-4 h-4 mr-2" />
            Niveles de Riesgo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cases">
          <CasesTab
            filteredCases={s.filteredCases}
            casesLoading={s.casesLoading}
            searchTerm={s.searchTerm}
            setSearchTerm={s.setSearchTerm}
            onEdit={s.handleOpenEditCaseDialog}
            onDelete={s.handleDeleteCase}
            onViewDetails={(caseItem) => {
              s.setSelectedCase(caseItem);
              s.setIsCaseDetailsOpen(true);
            }}
            activePeriodName={s.activePeriodName}
          />
        </TabsContent>

        <TabsContent value="types">
          <CaseTypesTab
            caseTypes={s.caseTypes}
            caseTypesLoading={s.caseTypesLoading}
            isTypeDialogOpen={s.isTypeDialogOpen}
            setIsTypeDialogOpen={s.setIsTypeDialogOpen}
            editingType={s.editingType}
            typeForm={s.typeForm}
            setTypeForm={s.setTypeForm}
            deleteTypeId={s.deleteTypeId}
            setDeleteTypeId={s.setDeleteTypeId}
            instituteId={s.instituteId}
            onCreateType={s.handleCreateType}
            onEditType={s.handleEditType}
            onUpdateType={s.handleUpdateType}
            onDeleteType={s.handleDeleteType}
            onCloseDialog={s.handleCloseTypeDialog}
          />
        </TabsContent>

        <TabsContent value="risk">
          <RiskLevelsTab
            riskLevels={s.riskLevels}
            riskLevelsLoading={s.riskLevelsLoading}
            isRiskDialogOpen={s.isRiskDialogOpen}
            setIsRiskDialogOpen={s.setIsRiskDialogOpen}
            editingRisk={s.editingRisk}
            riskForm={s.riskForm}
            setRiskForm={s.setRiskForm}
            deleteRiskId={s.deleteRiskId}
            setDeleteRiskId={s.setDeleteRiskId}
            instituteId={s.instituteId}
            onCreateRisk={s.handleCreateRisk}
            onEditRisk={s.handleEditRisk}
            onUpdateRisk={s.handleUpdateRisk}
            onDeleteRisk={s.handleDeleteRisk}
            onCloseDialog={s.handleCloseRiskDialog}
          />
        </TabsContent>
      </Tabs>

      {/* ── Dialogs ── */}
      <CaseFormDialog
        open={s.isCreateDialogOpen}
        onOpenChange={s.setIsCreateDialogOpen}
        editingCase={s.editingCase}
        caseForm={s.caseForm}
        setCaseForm={s.setCaseForm}
        students={s.students}
        loadingStudents={s.loadingStudents}
        currentPeriod={s.currentPeriod}
        loadingPeriods={s.loadingPeriods}
        caseTypes={s.caseTypes}
        riskLevels={s.riskLevels}
        onSave={s.handleCreateCase}
        onClose={s.handleCloseCaseDialog}
      />

      <CaseDetailsDialog
        open={s.isCaseDetailsOpen}
        onOpenChange={s.setIsCaseDetailsOpen}
        selectedCase={s.selectedCase}
        sessions={s.sessions}
        sessionsLoading={s.sessionsLoading}
        onOpenSessionDialog={s.handleOpenSessionDialog}
        onDeleteSession={s.handleDeleteSession}
        followups={s.followups}
        followupsLoading={s.followupsLoading}
        onOpenFollowupDialog={s.handleOpenFollowupDialog}
        onDeleteFollowup={s.handleDeleteFollowup}
        meetings={s.meetings}
        meetingsLoading={s.meetingsLoading}
        onOpenMeetingDialog={s.handleOpenMeetingDialog}
        onDeleteMeeting={s.handleDeleteMeeting}
        files={s.files}
        filesLoading={s.filesLoading}
        onOpenFileDialog={s.handleOpenFileDialog}
        onPreviewFile={s.handlePreviewFile}
        onDownloadFile={s.handleDownloadFile}
        onDeleteFile={s.handleDeleteFile}
      />

      <SessionDialog
        open={s.isSessionDialogOpen}
        onOpenChange={s.setIsSessionDialogOpen}
        editingSession={s.editingSession}
        sessionForm={s.sessionForm}
        setSessionForm={s.setSessionForm}
        currentUser={s.currentUser}
        onSave={s.handleSaveSession}
      />

      <FollowupDialog
        open={s.isFollowupDialogOpen}
        onOpenChange={s.setIsFollowupDialogOpen}
        editingFollowup={s.editingFollowup}
        followupForm={s.followupForm}
        setFollowupForm={s.setFollowupForm}
        onSave={s.handleSaveFollowup}
      />

      <MeetingDialog
        open={s.isMeetingDialogOpen}
        onOpenChange={s.setIsMeetingDialogOpen}
        editingMeeting={s.editingMeeting}
        meetingForm={s.meetingForm}
        setMeetingForm={s.setMeetingForm}
        onSave={s.handleSaveMeeting}
      />

      <FileUploadDialog
        open={s.isFileDialogOpen}
        onOpenChange={s.setIsFileDialogOpen}
        fileForm={s.fileForm}
        setFileForm={s.setFileForm}
        selectedFile={s.selectedFile}
        onFileChange={s.handleFileChange}
        uploadingFile={s.uploadingFile}
        onUpload={s.handleUploadFile}
        academicCycles={s.academicCycles}
        loadingCycles={s.loadingCycles}
      />

      <FilePreviewDialog
        open={s.isPreviewDialogOpen}
        onOpenChange={s.setIsPreviewDialogOpen}
        previewFile={s.previewFile}
        previewUrl={s.previewUrl}
        onDownload={s.handleDownloadFile}
      />
    </div>
  );
}
