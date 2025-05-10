"use client"

import type React from "react"

import { useState } from "react"
import { Github, Linkedin, Mail, MapPin, Phone, Send } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { submitContactForm } from "@/lib/firebase/contact"

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await submitContactForm(formData)
      toast({
        title: "Message sent",
        description: "Thank you for your message. I'll get back to you soon!",
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      console.error("Error submitting contact form:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-12">
      <h2 className="mb-8 text-3xl font-bold">Contact Me</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
            <CardDescription>Fill out the form below and I'll get back to you as soon as possible.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Input name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Input
                    name="email"
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Input name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Textarea
                  name="message"
                  placeholder="Your Message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Feel free to reach out through any of these channels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-4">
              <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Location</h3>
                <p className="text-sm text-muted-foreground">San Francisco, CA</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Email</h3>
                <a href="mailto:contact@example.com" className="text-sm text-muted-foreground hover:text-foreground">
                  contact@example.com
                </a>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Phone className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Phone</h3>
                <a href="tel:+1234567890" className="text-sm text-muted-foreground hover:text-foreground">
                  +1 (234) 567-890
                </a>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Github className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">GitHub</h3>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  github.com/username
                </a>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Linkedin className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">LinkedIn</h3>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  linkedin.com/in/username
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
