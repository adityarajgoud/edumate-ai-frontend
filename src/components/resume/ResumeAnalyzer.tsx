import { useState } from "react";
import { Upload, FileText, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker?worker";
import mammoth from "mammoth";
import { useNotifications } from "@/context/NotificationContext";
import { postToBackend } from "@/lib/api"; // ✅ your helper function
import type { TextItem } from "pdfjs-dist/types/src/display/api";

pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

export const ResumeAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const { addNotification } = useNotifications();

  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      setFile(file);
      await handleAnalyze(file);
    }
  };

  const handleFileSelect = async (e: any) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFile(file);
      await handleAnalyze(file);
    }
  };

  const loadSampleResume = () => {
    const sampleText = `John Doe\nSoftware Engineer with 3+ years of experience in building scalable web applications. Skills: React, Node.js, MongoDB, AWS, CI/CD...`;
    analyzeWithGPT(sampleText);
    setFile(
      new File(["Sample Resume"], "sample-resume.txt", { type: "text/plain" })
    );
    addNotification({
      title: "Sample Resume Loaded",
      message: "Using a demo resume for analysis.",
    });
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText +=
          content.items
            .map((item) => ("str" in item ? (item as TextItem).str : ""))
            .join(" ") + "\n";
      }
      return fullText;
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } else if (file.type === "text/plain") {
      return await file.text();
    } else {
      throw new Error("Unsupported file type");
    }
  };

  const handleAnalyze = async (file: File) => {
    setAnalyzing(true);
    try {
      const resumeText = await extractTextFromFile(file);
      if (!resumeText.trim()) throw new Error("Empty resume text.");
      await analyzeWithGPT(resumeText);
    } catch (err) {
      console.error("❌ Analyze error:", err);
      setAnalysisResult("❌ Failed to extract or analyze resume.");
      addNotification({
        title: "Analyze Error",
        message: "Resume extraction or analysis failed.",
      });
    }
    setAnalyzing(false);
  };

  const analyzeWithGPT = async (resumeText: string) => {
    try {
      const messages = [
        {
          role: "system",
          content: "You are a professional resume reviewer.",
        },
        {
          role: "user",
          content: `Please review the following resume text and provide:

1. A score out of 100  
2. 3 key strengths  
3. 3 areas for improvement  
4. A rewritten improved summary  

Resume content:\n${resumeText}`,
        },
      ];

      const data = await postToBackend("/api/analyze", { messages }); // ✅ calling backend
      const content = data?.choices?.[0]?.message?.content;

      if (content) {
        setAnalysisResult(content);
        addNotification({
          title: "Resume Analyzed",
          message: "AI feedback is ready.",
        });
      } else {
        throw new Error("Empty AI response");
      }
    } catch (err) {
      console.error("GPT API Error:", err);
      setAnalysisResult("❌ AI analysis failed. Try again.");
      addNotification({
        title: "AI Error",
        message: "Backend or GPT-3.5 failed to respond.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Resume Analyzer</h1>
        <p className="text-muted-foreground">
          Get AI-powered feedback to improve your resume
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Upload Your Resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300",
              dragActive
                ? "border-primary bg-primary/5 scale-105"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50",
              file && "border-success bg-success/5"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-4">
              <div className="flex justify-center">
                <div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-full",
                    file ? "bg-success/10" : "bg-primary/10"
                  )}
                >
                  {file ? (
                    <FileText className="h-8 w-8 text-success" />
                  ) : (
                    <Upload className="h-8 w-8 text-primary" />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  {file
                    ? `✓ ${file.name}`
                    : "Drop your resume here or click to browse"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF, DOC, DOCX & TXT files
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            {file ? (
              <Button
                onClick={() => handleAnalyze(file)}
                disabled={analyzing}
                className="flex-1"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>{" "}
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" /> Analyze Resume
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={loadSampleResume}
                className="flex-1"
                size="lg"
              >
                Try Sample Resume
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {analysisResult && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <CardHeader>
            <CardTitle>AI Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 text-sm leading-relaxed">
              {analysisResult.split("\n").map((line, index) => {
                const trimmed = line.trim();
                if (trimmed.startsWith("Score:")) {
                  return (
                    <div key={index} className="text-yellow-300 font-semibold">
                      📊 {trimmed}
                    </div>
                  );
                }
                if (
                  trimmed.startsWith("Key Strengths:") ||
                  trimmed.startsWith("Strengths:")
                ) {
                  return (
                    <div
                      key={index}
                      className="text-green-400 font-semibold mt-2"
                    >
                      ✅ {trimmed}
                    </div>
                  );
                }
                if (trimmed.startsWith("Areas for Improvement:")) {
                  return (
                    <div
                      key={index}
                      className="text-red-400 font-semibold mt-2"
                    >
                      ❌ {trimmed}
                    </div>
                  );
                }
                if (
                  trimmed.startsWith("Rewritten") ||
                  trimmed.startsWith("Improved Summary:")
                ) {
                  return (
                    <div
                      key={index}
                      className="text-blue-400 font-semibold mt-2"
                    >
                      ✨ {trimmed}
                    </div>
                  );
                }
                return <p key={index}>{trimmed}</p>;
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
