import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
    ArrowLeft,
    AlertTriangle,
    AlertCircle,
    TrendingUp,
    Shield,
    Lightbulb,
    Activity,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Calendar,
    Target,
    ThumbsUp,
    ThumbsDown,
    MessageSquare
} from 'lucide-react';

interface Insight {
    id: number;
    insight_code: string;
    title: string;
    description: string;
    type: string;
    severity: string;
    category: string;
    status: string;
    priority: string;
    current_value?: number;
    threshold_value?: number;
    percentage_change?: number;
    trend_direction?: string;
    urgency: string;
    potential_impact?: number;
    confidence_score?: number;
    recommendations?: string[];
    action_items?: string[];
    detected_at: string;
    suggested_completion_date?: string;
    assigned_to?: {
        id: number;
        name: string;
    };
    created_by?: {
        name: string;
    };
    acknowledged_by?: {
        name: string;
    };
    resolved_by?: {
        name: string;
    };
    acknowledged_at?: string;
    resolved_at?: string;
    resolution_notes?: string;
    user_feedback_positive?: boolean;
    user_feedback_notes?: string;
}

interface User {
    id: number;
    name: string;
}

interface Props {
    insight: Insight;
    relatedInsights: Insight[];
}

const animationVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function Show({ insight, relatedInsights }: Props) {
    const [feedbackDialog, setFeedbackDialog] = useState(false);
    const [feedback, setFeedback] = useState({
        positive: true,
        notes: ''
    });
    const [statusDialog, setStatusDialog] = useState(false);
    const [newStatus, setNewStatus] = useState(insight.status);
    const [resolutionNotes, setResolutionNotes] = useState('');

    const getSeverityColor = (severity: string) => {
        const colors = {
            'low': 'bg-blue-100 text-blue-800 border-blue-200',
            'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'high': 'bg-orange-100 text-orange-800 border-orange-200',
            'critical': 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getStatusColor = (status: string) => {
        const colors = {
            'new': 'bg-blue-100 text-blue-800',
            'acknowledged': 'bg-yellow-100 text-yellow-800',
            'in_progress': 'bg-orange-100 text-orange-800',
            'resolved': 'bg-green-100 text-green-800',
            'dismissed': 'bg-gray-100 text-gray-800',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getTypeIcon = (type: string) => {
        const icons = {
            'anomaly_detection': AlertTriangle,
            'trend_analysis': TrendingUp,
            'performance_alert': AlertCircle,
            'optimization_suggestion': Lightbulb,
            'risk_warning': Shield,
        };
        return icons[type as keyof typeof icons] || Activity;
    };

    const formatType = (type: string) => {
        return type.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(value);
    };

    const handleAcknowledge = () => {
        router.post(`/admin/insights/${insight.id}/acknowledge`);
    };

    const handleUpdateStatus = () => {
        router.patch(`/admin/insights/${insight.id}/status`, {
            status: newStatus,
            resolution_notes: resolutionNotes
        });
        setStatusDialog(false);
    };

    const handleFeedback = () => {
        router.post(`/admin/insights/${insight.id}/feedback`, {
            feedback_positive: feedback.positive,
            feedback_notes: feedback.notes
        });
        setFeedbackDialog(false);
    };

    const TypeIcon = getTypeIcon(insight.type);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.visit('/admin/insights')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Insights
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{insight.title}</h2>
                            <p className="text-sm text-gray-600">{insight.insight_code}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {insight.status === 'new' && (
                            <Button onClick={handleAcknowledge}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Acknowledge
                            </Button>
                        )}
                        
                        <Dialog open={statusDialog} onOpenChange={setStatusDialog}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    Update Status
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Update Insight Status</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={newStatus} onValueChange={setNewStatus}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="new">New</SelectItem>
                                                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="resolved">Resolved</SelectItem>
                                                <SelectItem value="dismissed">Dismissed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {(newStatus === 'resolved' || newStatus === 'dismissed') && (
                                        <div>
                                            <Label htmlFor="notes">Resolution Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={resolutionNotes}
                                                onChange={(e) => setResolutionNotes(e.target.value)}
                                                placeholder="Add resolution notes..."
                                            />
                                        </div>
                                    )}
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setStatusDialog(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleUpdateStatus}>
                                            Update Status
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={feedbackDialog} onOpenChange={setFeedbackDialog}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Feedback
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Provide Feedback</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Was this insight helpful?</Label>
                                        <div className="flex gap-2 mt-2">
                                            <Button
                                                variant={feedback.positive ? "default" : "outline"}
                                                onClick={() => setFeedback(prev => ({ ...prev, positive: true }))}
                                            >
                                                <ThumbsUp className="w-4 h-4 mr-2" />
                                                Helpful
                                            </Button>
                                            <Button
                                                variant={!feedback.positive ? "default" : "outline"}
                                                onClick={() => setFeedback(prev => ({ ...prev, positive: false }))}
                                            >
                                                <ThumbsDown className="w-4 h-4 mr-2" />
                                                Not Helpful
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="feedback-notes">Additional Comments (Optional)</Label>
                                        <Textarea
                                            id="feedback-notes"
                                            value={feedback.notes}
                                            onChange={(e) => setFeedback(prev => ({ ...prev, notes: e.target.value }))}
                                            placeholder="Share your thoughts about this insight..."
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setFeedbackDialog(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleFeedback}>
                                            Submit Feedback
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            }
        >
            <Head title={`Insight - ${insight.title}`} />

            <motion.div
                className="space-y-6"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
            >
                {/* Insight Overview */}
                <motion.div variants={animationVariants}>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <TypeIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
                                    <p className="text-gray-600 mb-4">{insight.description}</p>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        <Badge className={getSeverityColor(insight.severity)}>
                                            {insight.severity.charAt(0).toUpperCase() + insight.severity.slice(1)} Severity
                                        </Badge>
                                        <Badge className={getStatusColor(insight.status)}>
                                            {formatType(insight.status)}
                                        </Badge>
                                        <Badge variant="outline">
                                            {formatType(insight.type)}
                                        </Badge>
                                        <Badge variant="outline">
                                            {formatType(insight.category)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Detection</h4>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(insight.detected_at).toLocaleString()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Target className="w-4 h-4" />
                                            {insight.urgency} urgency
                                        </div>
                                        {insight.confidence_score && (
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-4 h-4" />
                                                {insight.confidence_score}% confidence
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {(insight.current_value !== undefined || insight.threshold_value !== undefined) && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Values</h4>
                                        <div className="space-y-2 text-sm text-gray-600">
                                            {insight.current_value !== undefined && (
                                                <div>Current: {insight.current_value.toLocaleString()}</div>
                                            )}
                                            {insight.threshold_value !== undefined && (
                                                <div>Threshold: {insight.threshold_value.toLocaleString()}</div>
                                            )}
                                            {insight.percentage_change !== undefined && (
                                                <div className={`flex items-center gap-1 ${insight.percentage_change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    <TrendingUp className="w-4 h-4" />
                                                    {insight.percentage_change > 0 ? '+' : ''}{insight.percentage_change}%
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Assignment</h4>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        {insight.assigned_to ? (
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                {insight.assigned_to.name}
                                            </div>
                                        ) : (
                                            <div className="text-gray-400">Not assigned</div>
                                        )}
                                        {insight.suggested_completion_date && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Due: {new Date(insight.suggested_completion_date).toLocaleDateString()}
                                            </div>
                                        )}
                                        {insight.potential_impact && (
                                            <div>
                                                Impact: {formatCurrency(insight.potential_impact)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Tracking</h4>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        {insight.acknowledged_at && insight.acknowledged_by && (
                                            <div>
                                                Acknowledged by {insight.acknowledged_by.name}<br />
                                                {new Date(insight.acknowledged_at).toLocaleDateString()}
                                            </div>
                                        )}
                                        {insight.resolved_at && insight.resolved_by && (
                                            <div>
                                                Resolved by {insight.resolved_by.name}<br />
                                                {new Date(insight.resolved_at).toLocaleDateString()}
                                            </div>
                                        )}
                                        {insight.created_by && (
                                            <div>
                                                Detected by {insight.created_by.name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Details Tabs */}
                <motion.div variants={animationVariants}>
                    <Tabs defaultValue="recommendations" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                            {insight.action_items && insight.action_items.length > 0 && (
                                <TabsTrigger value="actions">Action Items</TabsTrigger>
                            )}
                            {insight.resolution_notes && (
                                <TabsTrigger value="resolution">Resolution</TabsTrigger>
                            )}
                            {insight.user_feedback_notes && (
                                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value="recommendations">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recommendations</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {insight.recommendations && insight.recommendations.length > 0 ? (
                                        <ul className="space-y-2">
                                            {insight.recommendations.map((recommendation, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                                    <span>{recommendation}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500">No recommendations available</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {insight.action_items && insight.action_items.length > 0 && (
                            <TabsContent value="actions">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Action Items</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {insight.action_items.map((item, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}

                        {insight.resolution_notes && (
                            <TabsContent value="resolution">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Resolution Notes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="whitespace-pre-wrap">{insight.resolution_notes}</p>
                                        {insight.resolved_by && insight.resolved_at && (
                                            <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                                                Resolved by {insight.resolved_by.name} on{' '}
                                                {new Date(insight.resolved_at).toLocaleString()}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}

                        {insight.user_feedback_notes && (
                            <TabsContent value="feedback">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>User Feedback</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                {insight.user_feedback_positive ? (
                                                    <ThumbsUp className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <ThumbsDown className="w-5 h-5 text-red-500" />
                                                )}
                                                <span className="font-medium">
                                                    {insight.user_feedback_positive ? 'Helpful' : 'Not Helpful'}
                                                </span>
                                            </div>
                                            <p className="whitespace-pre-wrap">{insight.user_feedback_notes}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}
                    </Tabs>
                </motion.div>

                {/* Related Insights */}
                {relatedInsights.length > 0 && (
                    <motion.div variants={animationVariants}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Related Insights</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {relatedInsights.map((relatedInsight) => (
                                        <div
                                            key={relatedInsight.id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                            onClick={() => router.visit(`/admin/insights/${relatedInsight.id}`)}
                                        >
                                            <div>
                                                <h4 className="font-medium text-gray-900">{relatedInsight.title}</h4>
                                                <p className="text-sm text-gray-600 line-clamp-1">
                                                    {relatedInsight.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getSeverityColor(relatedInsight.severity)}>
                                                    {relatedInsight.severity}
                                                </Badge>
                                                <Badge className={getStatusColor(relatedInsight.status)}>
                                                    {relatedInsight.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </motion.div>
        </AuthenticatedLayout>
    );
}