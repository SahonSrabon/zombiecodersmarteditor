import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Lock, Eye } from "lucide-react"

export function PrivacyBanner() {
  return (
    <Alert className="mb-4 border-green-200 bg-green-50">
      <Shield className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span>সম্পূর্ণ লোকাল</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>কোনো ট্র্যাকিং নেই</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>ইউজার নিয়ন্ত্রিত</span>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
